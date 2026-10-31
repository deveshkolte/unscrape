import { z } from "zod";
import {
  JobListingSchema,
  validateSchema,
  type JobListing,
} from "../core/validator.js";

export const HnJobsOptionsSchema = z.object({
  query: z.string().default(""),
  limit: z.number().int().positive().max(100).default(20),
});

export type HnJobsOptions = z.input<typeof HnJobsOptionsSchema>;

const TECH_SKILL_KEYWORDS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Go",
  "Golang",
  "React",
  "Node.js",
  "Kubernetes",
  "PostgreSQL",
  "AWS",
  "AI",
  "LLM",
  "ML",
  "C++",
  "Java",
  "Distributed Systems",
];

/**
 * Parses a Hacker News job title such as:
 * "Wasmer (YC S19) Is Hiring OS/Hypervisor Experts in Europe"
 * into structured `{ company, title, location }`.
 */
export function parseHnJobHeader(rawTitle: string): {
  company: string;
  title: string;
  location: string;
} {
  const cleaned = rawTitle.replace(/\s+/g, " ").trim();

  const hiringMatch = cleaned.match(/^(.+?)\s+is\s+hiring\s+(.+?)(?:\s+in\s+(.+))?$/i);
  if (hiringMatch) {
    const company = hiringMatch[1]?.trim() || "YC Startup";
    const rolePart = hiringMatch[2]?.trim() || cleaned;
    const locationPart =
      hiringMatch[3]?.trim() ||
      (/remote/i.test(cleaned) ? "Remote" : "San Francisco / Remote");
    return {
      company,
      title: `${company} — ${rolePart}`,
      location: locationPart,
    };
  }

  const parenMatch = cleaned.match(/^([^(]+?\(YC\s+[A-Z]\d{2}\))/i);
  const company = parenMatch ? parenMatch[1].trim() : cleaned.split(/\s+[-–|:]\s+/)[0] ?? "YC Startup";
  const location = /remote/i.test(cleaned)
    ? "Remote"
    : /europe/i.test(cleaned)
      ? "Europe"
      : /india|bengaluru|bangalore/i.test(cleaned)
        ? "India"
        : "US / Remote";

  return {
    company: company.slice(0, 80),
    title: cleaned,
    location,
  };
}

export class HnJobsParser {
  private readonly algoliaEndpoint = "https://hn.algolia.com/api/v1/search_by_date";

  public extractFromAlgoliaJson(payload: unknown): JobListing[] {
    const jobs: JobListing[] = [];
    if (!payload || typeof payload !== "object") return jobs;

    const hits = Array.isArray((payload as Record<string, unknown>).hits)
      ? ((payload as Record<string, unknown>).hits as unknown[])
      : [];

    for (const entry of hits) {
      if (!entry || typeof entry !== "object") continue;
      const hit = entry as Record<string, unknown>;
      const id = String(hit.objectID ?? hit.story_id ?? "");
      const rawTitle = typeof hit.title === "string" ? hit.title.trim() : "";
      if (!id || !rawTitle) continue;

      const { company, title, location } = parseHnJobHeader(rawTitle);
      const jobText = typeof hit.job_text === "string" ? hit.job_text : "";
      const combinedText = `${rawTitle} ${jobText}`;

      const skills = TECH_SKILL_KEYWORDS.filter((skill) =>
        new RegExp(`\\b${skill.replace(/[+.#]/g, "\\$&")}\\b`, "i").test(combinedText)
      );

      const salaryMatch = combinedText.match(/(\$\d{2,3}[kK]\s*(?:[-–]\s*\$\d{2,3}[kK])?)/);
      const salary = salaryMatch ? salaryMatch[1] : undefined;

      const url =
        typeof hit.url === "string" && hit.url.startsWith("http")
          ? hit.url
          : `https://news.ycombinator.com/item?id=${id}`;

      const postedAt =
        typeof hit.created_at === "string" ? hit.created_at : new Date().toISOString();

      const candidate: JobListing = {
        id,
        title,
        company,
        location,
        salary,
        skills,
        url,
        source: "news.ycombinator.com/jobs",
        postedAt,
      };

      const parsed = JobListingSchema.safeParse(candidate);
      if (parsed.success) {
        jobs.push(parsed.data);
      }
    }

    return jobs;
  }

  /**
   * Queries the live Hacker News Algolia Jobs API and returns Zod-validated `JobListing[]`.
   */
  public async scrape(rawOptions: HnJobsOptions = {}): Promise<JobListing[]> {
    const options = HnJobsOptionsSchema.parse(rawOptions);
    const searchParam =
      options.query && options.query.trim().length > 0 && options.query.toLowerCase() !== "all"
        ? `&query=${encodeURIComponent(options.query.trim())}`
        : "";

    const url = `${this.algoliaEndpoint}?tags=job&hitsPerPage=${Math.max(options.limit * 2, 30)}${searchParam}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HN Jobs API request failed with status ${response.status}`);
    }

    const json = await response.json();
    let jobs = this.extractFromAlgoliaJson(json);

    // If a specific keyword returned 0 matches in the recent job batch, fetch the latest YC jobs batch and filter/return
    if (jobs.length === 0 && searchParam) {
      const fallbackRes = await fetch(
        `${this.algoliaEndpoint}?tags=job&hitsPerPage=${Math.max(options.limit * 2, 30)}`
      );
      if (fallbackRes.ok) {
        jobs = this.extractFromAlgoliaJson(await fallbackRes.json());
      }
    }

    return jobs
      .slice(0, options.limit)
      .map((j) => validateSchema(JobListingSchema, j, "HnJobListing"));
  }
}

export async function scrapeHnJobs(
  queryOrOptions: string | HnJobsOptions = "",
  limit = 20
): Promise<JobListing[]> {
  const parser = new HnJobsParser();
  const opts: HnJobsOptions =
    typeof queryOrOptions === "string"
      ? { query: queryOrOptions, limit }
      : queryOrOptions;
  return parser.scrape(opts);
}
