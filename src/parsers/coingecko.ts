import { z } from "zod";
import {
  StockQuoteSchema,
  validateSchema,
  type StockQuote,
} from "../core/validator.js";

export const CoinGeckoOptionsSchema = z.object({
  query: z.string().default(""),
  currency: z.enum(["inr", "usd"]).default("inr"),
  limit: z.number().int().positive().max(100).default(20),
});

export type CoinGeckoOptions = z.input<typeof CoinGeckoOptionsSchema>;

export class CoinGeckoParser {
  private readonly baseUrl = "https://api.coingecko.com/api/v3";

  public extractFromMarketsJson(payload: unknown): StockQuote[] {
    const quotes: StockQuote[] = [];
    if (!Array.isArray(payload)) return quotes;

    for (const entry of payload) {
      if (!entry || typeof entry !== "object") continue;
      const coin = entry as Record<string, unknown>;
      const symbol =
        typeof coin.symbol === "string" ? coin.symbol.trim().toUpperCase() : "";
      const name = typeof coin.name === "string" ? coin.name.trim() : symbol;
      const lastPrice =
        typeof coin.current_price === "number" ? coin.current_price : NaN;

      if (!symbol || !Number.isFinite(lastPrice) || lastPrice < 0) continue;

      const change =
        typeof coin.price_change_24h === "number"
          ? Number(coin.price_change_24h.toFixed(2))
          : 0;
      const pChange =
        typeof coin.price_change_percentage_24h === "number"
          ? Number(coin.price_change_percentage_24h.toFixed(2))
          : 0;

      const dayHigh =
        typeof coin.high_24h === "number" && coin.high_24h >= 0
          ? coin.high_24h
          : undefined;
      const dayLow =
        typeof coin.low_24h === "number" && coin.low_24h >= 0
          ? coin.low_24h
          : undefined;
      const volume =
        typeof coin.total_volume === "number" && coin.total_volume >= 0
          ? coin.total_volume
          : undefined;

      const marketCapCr =
        typeof coin.market_cap === "number" && coin.market_cap > 0
          ? Number((coin.market_cap / 10_000_000).toFixed(2))
          : undefined;

      const timestamp =
        typeof coin.last_updated === "string"
          ? coin.last_updated
          : new Date().toISOString();

      const candidate: StockQuote = {
        symbol,
        companyName: name,
        lastPrice,
        change,
        pChange,
        dayHigh,
        dayLow,
        volume,
        marketCapCr,
        source: "coingecko.com",
        timestamp,
      };

      const parsed = StockQuoteSchema.safeParse(candidate);
      if (parsed.success) {
        quotes.push(parsed.data);
      }
    }

    return quotes;
  }

  public async scrape(rawOptions: CoinGeckoOptions = {}): Promise<StockQuote[]> {
    const options = CoinGeckoOptionsSchema.parse(rawOptions);
    const url = `${this.baseUrl}/coins/markets?vs_currency=${options.currency}&order=market_cap_desc&per_page=${Math.max(options.limit * 2, 50)}&page=1&sparkline=false`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "unscrape-sdk/2.0",
      },
    });

    if (!res.ok) {
      throw new Error(`CoinGecko API failed with status ${res.status}`);
    }

    const json = await res.json();
    let quotes = this.extractFromMarketsJson(json);

    const filterQuery = options.query.trim().toLowerCase();
    if (filterQuery && filterQuery !== "all" && filterQuery !== "crypto") {
      const filtered = quotes.filter(
        (q) =>
          q.symbol.toLowerCase().includes(filterQuery) ||
          (q.companyName?.toLowerCase().includes(filterQuery) ?? false)
      );
      if (filtered.length > 0) {
        quotes = filtered;
      }
    }

    return quotes
      .slice(0, options.limit)
      .map((q) => validateSchema(StockQuoteSchema, q, "CoinGeckoQuote"));
  }
}

export async function scrapeCoinGecko(
  queryOrOptions: string | CoinGeckoOptions = "",
  limit = 20
): Promise<StockQuote[]> {
  const parser = new CoinGeckoParser();
  const opts: CoinGeckoOptions =
    typeof queryOrOptions === "string"
      ? { query: queryOrOptions, limit }
      : queryOrOptions;
  return parser.scrape(opts);
}
