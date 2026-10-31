import { z } from "zod";
import {
  CommunityPostSchema,
  validateSchema,
  type CommunityPost,
} from "../core/validator.js";

export const NpmRegistryOptionsSchema = z.object({
  query: z.string().min(1, "NPM package search query must not be empty").default("playwright"),
  limit: z.number().int().positive().max(100).default(20),
});

export type NpmRegistryOptions = z.input<typeof NpmRegistryOptionsSchema>;

export class NpmRegistryParser {
  private readonly searchEndpoint = "https://registry.npmjs.org/-/v1/search";

  public extractFromSearchJson(payload: unknown): CommunityPost[] {
    const items: CommunityPost[] = [];
    if (!payload || typeof payload !== "object") return items;

    const root = payload as Record<string, unknown>;
    const objects = Array.isArray(root.objects) ? root.objects : [];

    for (const entry of objects) {
      if (!entry || typeof entry !== "object") continue;
      const obj = entry as Record<string, unknown>;
      const pkg = (obj.package as Record<string, unknown> | undefined) ?? {};
      const name = typeof pkg.name === "string" ? pkg.name.trim() : "";
      if (!name) continue;

      const version = typeof pkg.version === "string" ? pkg.version.trim() : "latest";
      const description =
        typeof pkg.description === "string" ? pkg.description.trim() : undefined;

      const publisher = (pkg.publisher as Record<string, unknown> | undefined) ?? {};
      const author =
        typeof publisher.username === "string" ? publisher.username : undefined;

      const downloads = (obj.downloads as Record<string, unknown> | undefined) ?? {};
      const scoreObj = (obj.score as Record<string, unknown> | undefined) ?? {};
      const monthlyDownloads =
        typeof downloads.monthly === "number"
          ? downloads.monthly
          : typeof scoreObj.final === "number"
            ? Math.round(scoreObj.final * 100)
            : 0;

      const links = (pkg.links as Record<string, unknown> | undefined) ?? {};
      const url =
        typeof links.npm === "string" && links.npm.startsWith("http")
          ? links.npm
          : `https://www.npmjs.com/package/${name}`;

      const postedAt = typeof pkg.date === "string" ? pkg.date : undefined;

      const candidate: CommunityPost = {
        id: `${name}@${version}`,
        title: `${name}@${version}`,
        description,
        author,
        community: "npmjs.com",
        score: monthlyDownloads,
        commentCount: 0,
        url,
        source: "registry.npmjs.org",
        postedAt,
      };

      const parsed = CommunityPostSchema.safeParse(candidate);
      if (parsed.success) {
        items.push(parsed.data);
      }
    }

    return items;
  }

  public async scrape(rawOptions: NpmRegistryOptions = {}): Promise<CommunityPost[]> {
    const options = NpmRegistryOptionsSchema.parse(rawOptions);
    const url = `${this.searchEndpoint}?text=${encodeURIComponent(options.query)}&size=${options.limit}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "unscrape-sdk/2.0",
      },
    });

    if (!res.ok) {
      throw new Error(`NPM Registry search failed with status ${res.status}`);
    }

    const json = await res.json();
    const items = this.extractFromSearchJson(json).slice(0, options.limit);

    return items.map((i) => validateSchema(CommunityPostSchema, i, "NpmPackageRecord"));
  }
}

export async function scrapeNpmRegistry(
  queryOrOptions: string | NpmRegistryOptions = "playwright",
  limit = 20
): Promise<CommunityPost[]> {
  const parser = new NpmRegistryParser();
  const opts: NpmRegistryOptions =
    typeof queryOrOptions === "string"
      ? { query: queryOrOptions, limit }
      : queryOrOptions;
  return parser.scrape(opts);
}
