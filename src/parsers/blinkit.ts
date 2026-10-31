import * as cheerio from "cheerio";
import { type Page } from "playwright";
import { z } from "zod";
import { captureJsonResponses, StealthBrowser } from "../core/browser.js";
import { resolveGeoLocation, type GeoInput, type GeoLocation } from "../core/geo.js";
import {
  CommerceItemSchema,
  validateSchema,
  type CommerceItem,
} from "../core/validator.js";

export const BlinkitOptionsSchema = z.object({
  query: z.string().min(1, "Search query must not be empty"),
  city: z.custom<GeoInput>().optional().default("bengaluru"),
  limit: z.number().int().positive().max(200).default(20),
  headless: z.boolean().default(true),
  timeoutMs: z.number().int().positive().default(35_000),
});

export type BlinkitOptions = z.input<typeof BlinkitOptionsSchema>;

/**
 * Parses a price string such as "₹66" or "₹1,299.50" into a numeric INR value.
 */
export function parsePrice(raw: string | number | null | undefined): number | null {
  if (typeof raw === "number") {
    return Number.isFinite(raw) && raw >= 0 ? raw : null;
  }
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export class BlinkitParser {
  private readonly baseUrl = "https://blinkit.com";

  /**
   * Injects hyperlocal dark-store geolocation cookies (`gr_1_lat`, `gr_1_lon`, `gr_1_locality`)
   * before hitting Blinkit's search route.
   */
  private async configureLocation(page: Page, geo: GeoLocation): Promise<void> {
    await page.context().addCookies([
      {
        name: "gr_1_lat",
        value: String(geo.lat),
        domain: ".blinkit.com",
        path: "/",
      },
      {
        name: "gr_1_lon",
        value: String(geo.lon),
        domain: ".blinkit.com",
        path: "/",
      },
      {
        name: "gr_1_locality",
        value: encodeURIComponent(geo.locality),
        domain: ".blinkit.com",
        path: "/",
      },
    ]);
  }

  /**
   * Extracts products from Blinkit's `/v1/layout/search` JSON response snippets.
   * Handles both `snippet.data.atc_action.add_to_cart.cart_item` and `snippet.data` widget fields.
   */
  public extractFromApiJson(payload: unknown, defaultEta = "10 MINS"): CommerceItem[] {
    const items: CommerceItem[] = [];
    if (!payload || typeof payload !== "object") return items;

    const seenIds = new Set<string>();
    const scrapedAt = new Date().toISOString();

    const extractTextField = (field: unknown): string | undefined => {
      if (typeof field === "string" && field.trim().length > 0) {
        return field.trim();
      }
      if (field && typeof field === "object") {
        const text = (field as Record<string, unknown>).text;
        if (typeof text === "string" && text.trim().length > 0) {
          return text.replace(/\s+/g, " ").trim();
        }
      }
      return undefined;
    };

    const visit = (node: unknown): void => {
      if (!node || typeof node !== "object") return;

      if (Array.isArray(node)) {
        for (const child of node) visit(child);
        return;
      }

      const record = node as Record<string, unknown>;
      const dataObj =
        record.data && typeof record.data === "object" && !Array.isArray(record.data)
          ? (record.data as Record<string, unknown>)
          : record;

      const atcAction = dataObj.atc_action as Record<string, unknown> | undefined;
      const addToCart = atcAction?.add_to_cart as Record<string, unknown> | undefined;
      const cartItem = addToCart?.cart_item as Record<string, unknown> | undefined;
      const identity = dataObj.identity as Record<string, unknown> | undefined;

      const rawId =
        cartItem?.product_id ??
        dataObj.product_id ??
        identity?.id ??
        dataObj.id;

      const title =
        (typeof cartItem?.product_name === "string" ? cartItem.product_name.trim() : undefined) ??
        (typeof cartItem?.display_name === "string" ? cartItem.display_name.trim() : undefined) ??
        extractTextField(dataObj.name) ??
        extractTextField(dataObj.display_name);

      const rawPrice =
        cartItem?.price ??
        extractTextField(dataObj.normal_price) ??
        dataObj.price;

      if (
        (typeof rawId === "string" || typeof rawId === "number") &&
        title &&
        rawPrice !== undefined
      ) {
        const idStr = String(rawId).trim();
        const price = parsePrice(rawPrice as string | number);

        if (idStr && !seenIds.has(idStr) && price !== null) {
          const mrpVal =
            parsePrice(cartItem?.mrp as string | number | undefined) ??
            parsePrice(extractTextField(dataObj.mrp));

          const brand =
            (typeof cartItem?.brand === "string" && cartItem.brand.trim().length > 0
              ? cartItem.brand.trim()
              : undefined) ??
            (typeof dataObj.brand === "string" && dataObj.brand.trim().length > 0
              ? dataObj.brand.trim()
              : undefined);

          const unit =
            (typeof cartItem?.unit === "string" && cartItem.unit.trim().length > 0
              ? cartItem.unit.trim()
              : undefined) ??
            extractTextField(dataObj.variant) ??
            (typeof dataObj.unit === "string" ? dataObj.unit.trim() : undefined);

          const offerTag = dataObj.offer_tag as Record<string, unknown> | undefined;
          const discount =
            extractTextField(offerTag?.title) ??
            (mrpVal && mrpVal > price
              ? `${Math.round(((mrpVal - price) / mrpVal) * 100)}% OFF`
              : undefined);

          const inventory =
            typeof cartItem?.inventory === "number"
              ? cartItem.inventory
              : typeof dataObj.inventory === "number"
                ? dataObj.inventory
                : undefined;

          const isSoldOut =
            dataObj.is_sold_out === true ||
            dataObj.out_of_stock === true ||
            dataObj.product_state === "out_of_stock" ||
            (inventory !== undefined && inventory <= 0 && cartItem === undefined);

          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

          const candidate: CommerceItem = {
            id: idStr,
            title,
            brand,
            price,
            mrp: mrpVal ?? undefined,
            discount,
            unit,
            inStock: !isSoldOut,
            deliveryEta: extractTextField(dataObj.eta) ?? defaultEta,
            source: "blinkit.com",
            url: `${this.baseUrl}/prn/${slug || "item"}/prid/${idStr}`,
            scrapedAt,
          };

          const parsed = CommerceItemSchema.safeParse(candidate);
          if (parsed.success) {
            seenIds.add(idStr);
            items.push(parsed.data);
          }
        }
      }

      for (const value of Object.values(record)) {
        if (value && typeof value === "object") {
          visit(value);
        }
      }
    };

    visit(payload);
    return items;
  }

  /**
   * Fallback HTML card extractor using Cheerio.
   */
  public extractFromHtml(html: string): CommerceItem[] {
    const $ = cheerio.load(html);
    const items: CommerceItem[] = [];
    const seenIds = new Set<string>();
    const scrapedAt = new Date().toISOString();

    const cardSelectors = [
      'a[href*="/prn/"]',
      '[data-testid*="product"]',
      '[role="button"][id^="product_"]',
      'div[class*="Product__UpdatedPlpProductContainer"]',
    ].join(", ");

    $(cardSelectors).each((index, element) => {
      const card = $(element);
      const href = card.attr("href") ?? card.find("a[href]").first().attr("href") ?? null;
      const pridMatch = href?.match(/\/prid\/(\d+)/);
      const id =
        pridMatch?.[1] ??
        card.attr("data-product-id") ??
        card.attr("id") ??
        `blinkit-dom-${index + 1}`;

      if (seenIds.has(id)) return;

      const title =
        card
          .find(
            '[class*="ProductTitle"], [data-testid="product-title"], h3, h4, div[style*="line-clamp"]'
          )
          .first()
          .text()
          .trim() || "";
      if (!title) return;

      const unit =
        card
          .find('[class*="ProductVariant"], [data-testid="product-unit"], [class*="variant"]')
          .first()
          .text()
          .trim() || undefined;

      const textTokens: string[] = [];
      card.find("div, span").each((_, node) => {
        const text = $(node).clone().children().remove().end().text().trim();
        if (text) textTokens.push(text);
      });

      const priceTokens = textTokens.filter((token) => /^₹\s*\d+/.test(token));
      const price = parsePrice(priceTokens[0]);
      if (price === null) return;

      const mrp = priceTokens.length > 1 ? (parsePrice(priceTokens[1]) ?? undefined) : undefined;
      const deliveryEta = textTokens.find((token) => /\d+\s*MINS?/i.test(token)) ?? "10 MINS";
      const isOutOfStock = /out of stock|sold out|currently unavailable/i.test(card.text());

      const url = href
        ? href.startsWith("http")
          ? href
          : `${this.baseUrl}${href.startsWith("/") ? "" : "/"}${href}`
        : `${this.baseUrl}/s/?q=${encodeURIComponent(title)}`;

      const candidate: CommerceItem = {
        id,
        title,
        price,
        mrp,
        unit,
        inStock: !isOutOfStock,
        deliveryEta,
        source: "blinkit.com",
        url,
        scrapedAt,
      };

      const parsed = CommerceItemSchema.safeParse(candidate);
      if (parsed.success) {
        seenIds.add(id);
        items.push(parsed.data);
      }
    });

    return items;
  }

  /**
   * Executes a live Blinkit search scrape with city coordinate injection and
   * `/v1/layout/search` JSON response interception.
   */
  public async scrape(rawOptions: BlinkitOptions): Promise<CommerceItem[]> {
    const options = BlinkitOptionsSchema.parse(rawOptions);
    const resolvedGeo = resolveGeoLocation(options.city);

    const browser = new StealthBrowser({
      headless: options.headless,
      geo: resolvedGeo,
      timeoutMs: options.timeoutMs,
      blockResources: true,
      blockedResourceTypes: ["image", "font", "media"],
    });

    return browser.withPage(async (page, session) => {
      const collected = new Map<string, CommerceItem>();
      await this.configureLocation(page, resolvedGeo);

      const searchSniffer = captureJsonResponses(page, "/v1/layout/search");
      const etaSniffer = captureJsonResponses(page, "/v1/consumerweb/eta");

      const searchUrl = `${this.baseUrl}/s/?q=${encodeURIComponent(options.query)}`;
      await session.navigateSafely(searchUrl, {
        waitUntil: "domcontentloaded",
      });

      await searchSniffer.waitForNext(10_000);
      await page.waitForTimeout(1_500);

      let storeEta = "10 MINS";
      const etaPayload = etaSniffer.responses[0]?.data as Record<string, unknown> | undefined;
      if (etaPayload && typeof etaPayload.eta_in_minutes === "number") {
        storeEta = `${etaPayload.eta_in_minutes} MINS`;
      }

      for (const captured of searchSniffer.responses) {
        for (const item of this.extractFromApiJson(captured.data, storeEta)) {
          if (!collected.has(item.id)) {
            collected.set(item.id, item);
          }
        }
      }

      if (collected.size < options.limit) {
        const html = await page.content();
        for (const item of this.extractFromHtml(html)) {
          if (!collected.has(item.id)) {
            collected.set(item.id, item);
          }
        }
      }

      searchSniffer.stop();
      etaSniffer.stop();

      return Array.from(collected.values())
        .slice(0, options.limit)
        .map((item) => validateSchema(CommerceItemSchema, item, "BlinkitCommerceItem"));
    });
  }
}

export async function scrapeBlinkit(
  queryOrOptions: string | BlinkitOptions,
  city: GeoInput = "bengaluru",
  limit = 20
): Promise<CommerceItem[]> {
  const parser = new BlinkitParser();
  const opts: BlinkitOptions =
    typeof queryOrOptions === "string"
      ? { query: queryOrOptions, city, limit }
      : queryOrOptions;
  return parser.scrape(opts);
}

export const parseBlinkit = scrapeBlinkit;
