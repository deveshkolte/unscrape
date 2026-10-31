import * as cheerio from "cheerio";
import { z } from "zod";
import { StealthBrowser } from "../core/browser.js";
import {
  CommunityPostSchema,
  validateSchema,
  type CommunityPost,
} from "../core/validator.js";

export const RedditSearchOptionsSchema = z.object({
  query: z.string().min(1, "Reddit search query must not be empty").default("typescript"),
  limit: z.number().int().positive().max(100).default(20),
  headless: z.boolean().default(true),
  timeoutMs: z.number().int().positive().default(35_000),
});

export type RedditSearchOptions = z.input<typeof RedditSearchOptionsSchema>;

export class RedditSearchParser {
  private readonly baseUrl = "https://www.reddit.com";
  private readonly pullPushEndpoint = "https://api.pullpush.io/reddit/search/submission/";

  /**
   * Extracts structured Reddit submissions from JSON API payloads (`data` array or `data.children`).
   */
  public extractFromApiJson(payload: unknown): CommunityPost[] {
    const posts: CommunityPost[] = [];
    if (!payload || typeof payload !== "object") return posts;

    const root = payload as Record<string, unknown>;
    const rawItems = Array.isArray(root.data)
      ? root.data
      : root.data &&
          typeof root.data === "object" &&
          Array.isArray((root.data as Record<string, unknown>).children)
        ? ((root.data as Record<string, unknown>).children as unknown[]).map((c) =>
            c && typeof c === "object" ? (c as Record<string, unknown>).data : null
          )
        : [];

    const seenIds = new Set<string>();

    for (const entry of rawItems) {
      if (!entry || typeof entry !== "object") continue;
      const item = entry as Record<string, unknown>;
      const rawId = typeof item.id === "string" ? item.id.trim() : "";
      const title = typeof item.title === "string" ? item.title.replace(/\s+/g, " ").trim() : "";
      if (!rawId || !title) continue;

      const id = rawId.startsWith("t3_") ? rawId : `t3_${rawId}`;
      if (seenIds.has(id)) continue;

      const author =
        typeof item.author === "string" && item.author.trim().length > 0
          ? item.author.startsWith("u/")
            ? item.author.trim()
            : `u/${item.author.trim()}`
          : undefined;

      const community =
        (typeof item.subreddit_name_prefixed === "string" &&
        item.subreddit_name_prefixed.trim().length > 0
          ? item.subreddit_name_prefixed.trim()
          : undefined) ??
        (typeof item.subreddit === "string" && item.subreddit.trim().length > 0
          ? `r/${item.subreddit.trim()}`
          : undefined);

      const score =
        typeof item.score === "number" && item.score >= 0
          ? Math.round(item.score)
          : typeof item.ups === "number" && item.ups >= 0
            ? Math.round(item.ups)
            : 0;

      const commentCount =
        typeof item.num_comments === "number" && item.num_comments >= 0
          ? Math.round(item.num_comments)
          : 0;

      const permalink =
        typeof item.permalink === "string" && item.permalink.trim().length > 0
          ? item.permalink.trim()
          : `/comments/${rawId}`;

      const url = permalink.startsWith("http")
        ? permalink
        : `${this.baseUrl}${permalink.startsWith("/") ? "" : "/"}${permalink}`;

      const createdUtc =
        typeof item.created_utc === "number"
          ? new Date(item.created_utc * 1000).toISOString()
          : undefined;

      const candidate: CommunityPost = {
        id,
        title,
        author,
        community,
        score,
        commentCount,
        url,
        source: "reddit.com",
        postedAt: createdUtc,
      };

      const parsed = CommunityPostSchema.safeParse(candidate);
      if (parsed.success) {
        seenIds.add(id);
        posts.push(parsed.data);
      }
    }

    return posts;
  }

  /**
   * Extracts structured community posts from Reddit's live search DOM
   * (`search-telemetry-tracker[data-faceplate-tracking-context]` + `a[data-testid="post-title"]`).
   */
  public extractFromHtml(html: string): CommunityPost[] {
    const $ = cheerio.load(html);
    const posts: CommunityPost[] = [];
    const seenIds = new Set<string>();

    $('[data-testid="search-post-with-content-preview"], [data-testid="search-post-unit"]').each(
      (index, element) => {
        const container = $(element);
        const titleLink = container.find('a[data-testid="post-title"], a[href*="/comments/"]').first();
        const rawHref = titleLink.attr("href") ?? "";
        const title =
          titleLink.attr("aria-label")?.trim() ||
          titleLink.text().replace(/\s+/g, " ").trim() ||
          "";

        if (!title || !rawHref) return;

        let postId = "";
        let author: string | undefined;
        let community: string | undefined;

        container
          .find("search-telemetry-tracker[data-faceplate-tracking-context]")
          .each((__, trackerEl) => {
            const ctxRaw = $(trackerEl).attr("data-faceplate-tracking-context");
            if (!ctxRaw) return;
            try {
              const parsed = JSON.parse(ctxRaw) as Record<string, unknown>;
              const postObj = parsed.post as Record<string, unknown> | undefined;
              const profileObj = parsed.profile as Record<string, unknown> | undefined;
              const subObj = parsed.subreddit as Record<string, unknown> | undefined;

              if (typeof postObj?.id === "string" && !postId) {
                postId = postObj.id;
              }
              if (typeof profileObj?.name === "string" && !author) {
                author = `u/${profileObj.name}`;
              }
              if (typeof subObj?.name === "string" && !community) {
                community = `r/${subObj.name}`;
              }
            } catch {
              // Ignore non-JSON tracking contexts
            }
          });

        if (!postId) {
          const idMatch = rawHref.match(/\/comments\/([a-z0-9]+)/i);
          postId = idMatch?.[1] ? `t3_${idMatch[1]}` : `reddit-${index + 1}`;
        }

        if (seenIds.has(postId)) return;

        if (!community) {
          const subMatch = rawHref.match(/\/r\/([^/]+)/);
          if (subMatch?.[1]) {
            community = `r/${subMatch[1]}`;
          }
        }

        const numbers = container
          .find("faceplate-number")
          .map((__, numEl) => {
            const rawNum = $(numEl).attr("number") ?? $(numEl).text();
            const parsed = Number.parseInt(rawNum.replace(/[^0-9]/g, ""), 10);
            return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
          })
          .get();

        const score = numbers[0] ?? 0;
        const commentCount = numbers[1] ?? 0;

        const postedAt =
          container.find("faceplate-timeago time, time").first().attr("datetime") ?? undefined;
        const url = rawHref.startsWith("http")
          ? rawHref
          : `${this.baseUrl}${rawHref.startsWith("/") ? "" : "/"}${rawHref}`;

        const candidate: CommunityPost = {
          id: postId,
          title,
          author,
          community,
          score,
          commentCount,
          url,
          source: "reddit.com",
          postedAt,
        };

        const validated = CommunityPostSchema.safeParse(candidate);
        if (validated.success) {
          seenIds.add(postId);
          posts.push(validated.data);
        }
      }
    );

    return posts;
  }

  /**
   * Executes a live Reddit search using the JSON submission index API first
   * (bypassing Fastly's "Prove your humanity" wall), with `StealthBrowser` DOM fallback.
   */
  public async scrape(rawOptions: RedditSearchOptions): Promise<CommunityPost[]> {
    const options = RedditSearchOptionsSchema.parse(rawOptions);

    try {
      const apiUrl = `${this.pullPushEndpoint}?q=${encodeURIComponent(options.query)}&size=${Math.max(options.limit, 15)}`;
      const res = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
      });
      if (res.ok) {
        const json = await res.json();
        const apiPosts = this.extractFromApiJson(json).slice(0, options.limit);
        if (apiPosts.length > 0) {
          return apiPosts.map((p) =>
            validateSchema(CommunityPostSchema, p, "RedditCommunityPost")
          );
        }
      }
    } catch {
      // Fall back to StealthBrowser DOM extraction
    }

    const searchUrl = `${this.baseUrl}/search/?q=${encodeURIComponent(options.query)}`;
    const browser = new StealthBrowser({
      headless: options.headless,
      timeoutMs: options.timeoutMs,
      blockResources: false,
    });

    return browser.withPage(async (page, session) => {
      await session.navigateSafely(searchUrl, {
        waitUntil: "domcontentloaded",
        waitForSelector: 'a[data-testid="post-title"], a[href*="/comments/"]',
      });

      await page.waitForTimeout(1_500);
      const html = await page.content();
      const extracted = this.extractFromHtml(html).slice(0, options.limit);

      return extracted.map((post) =>
        validateSchema(CommunityPostSchema, post, "RedditCommunityPost")
      );
    });
  }
}

export async function scrapeRedditSearch(
  queryOrOptions: string | RedditSearchOptions = "typescript",
  limit = 20
): Promise<CommunityPost[]> {
  const parser = new RedditSearchParser();
  const opts: RedditSearchOptions =
    typeof queryOrOptions === "string"
      ? { query: queryOrOptions, limit }
      : queryOrOptions;
  return parser.scrape(opts);
}
