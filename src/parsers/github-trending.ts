import * as cheerio from "cheerio";
import { z } from "zod";
import { StealthBrowser } from "../core/browser.js";
import {
  GitHubRepoSchema,
  validateSchema,
  type GitHubRepo,
} from "../core/validator.js";

export const GitHubTrendingOptionsSchema = z.object({
  language: z.string().default(""),
  since: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  limit: z.number().int().positive().max(100).default(25),
  headless: z.boolean().default(true),
  timeoutMs: z.number().int().positive().default(30_000),
});

export type GitHubTrendingOptions = z.input<typeof GitHubTrendingOptionsSchema>;

export class GitHubTrendingParser {
  private readonly baseUrl = "https://github.com";

  public extractFromHtml(html: string): GitHubRepo[] {
    const $ = cheerio.load(html);
    const repos: GitHubRepo[] = [];
    const seenIds = new Set<string>();
    const scrapedAt = new Date().toISOString();

    $("article.Box-row").each((_, element) => {
      const row = $(element);
      const rawHref = row.find("h2 a").first().attr("href")?.trim() ?? "";
      const fullName = rawHref.replace(/^\//, "").trim();
      if (!fullName || seenIds.has(fullName)) return;

      const description =
        row.find("p.col-9, p").first().text().replace(/\s+/g, " ").trim() || undefined;
      const language =
        row.find('[itemprop="programmingLanguage"]').first().text().trim() || undefined;

      const starsRaw = row
        .find('a[href$="/stargazers"]')
        .first()
        .text()
        .replace(/[^0-9]/g, "");
      const stars = starsRaw ? Number.parseInt(starsRaw, 10) : 0;

      const forksRaw = row
        .find('a[href$="/forks"]')
        .first()
        .text()
        .replace(/[^0-9]/g, "");
      const forks = forksRaw ? Number.parseInt(forksRaw, 10) : 0;

      const todayMatch = row
        .find("span.d-inline-block.float-sm-right")
        .first()
        .text()
        .match(/([\d,]+)\s+stars\s+(?:today|this\s+week|this\s+month)/i);
      const starsToday = todayMatch
        ? Number.parseInt(todayMatch[1].replace(/,/g, ""), 10)
        : undefined;

      const candidate: GitHubRepo = {
        id: fullName,
        name: fullName,
        description,
        language,
        stars: Number.isFinite(stars) ? stars : 0,
        forks: Number.isFinite(forks) ? forks : 0,
        starsToday: starsToday !== undefined && Number.isFinite(starsToday) ? starsToday : undefined,
        url: `${this.baseUrl}/${fullName}`,
        source: "github.com/trending",
        scrapedAt,
      };

      const parsed = GitHubRepoSchema.safeParse(candidate);
      if (parsed.success) {
        seenIds.add(fullName);
        repos.push(parsed.data);
      }
    });

    return repos;
  }

  public async scrape(rawOptions: GitHubTrendingOptions = {}): Promise<GitHubRepo[]> {
    const options = GitHubTrendingOptionsSchema.parse(rawOptions);
    const cleanLang = options.language.trim().toLowerCase();
    const langPath =
      cleanLang && cleanLang !== "all" && cleanLang !== "trending"
        ? `/${encodeURIComponent(cleanLang)}`
        : "";
    const targetUrl = `${this.baseUrl}/trending${langPath}?since=${options.since}`;

    const browser = new StealthBrowser({
      headless: options.headless,
      timeoutMs: options.timeoutMs,
      blockResources: true,
      blockedResourceTypes: ["image", "font", "media"],
    });

    return browser.withPage(async (page, session) => {
      await session.navigateSafely(targetUrl, {
        waitUntil: "domcontentloaded",
        waitForSelector: "article.Box-row",
      });

      const html = await page.content();
      const extracted = this.extractFromHtml(html).slice(0, options.limit);

      return extracted.map((repo) =>
        validateSchema(GitHubRepoSchema, repo, "GitHubTrendingRepo")
      );
    });
  }
}

export async function scrapeGitHubTrending(
  languageOrOptions: string | GitHubTrendingOptions = "",
  limit = 25
): Promise<GitHubRepo[]> {
  const parser = new GitHubTrendingParser();
  const opts: GitHubTrendingOptions =
    typeof languageOrOptions === "string"
      ? { language: languageOrOptions, limit }
      : languageOrOptions;
  return parser.scrape(opts);
}
