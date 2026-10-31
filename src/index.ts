#!/usr/bin/env node
import { COMMUNITY_CATALOG, PRO_VAULT_URL } from "./catalog.js";
import { scrapeBlinkit } from "./parsers/blinkit.js";
import { scrapeCoinGecko } from "./parsers/coingecko.js";
import { scrapeGitHubTrending } from "./parsers/github-trending.js";
import { scrapeHnJobs } from "./parsers/hn-jobs.js";
import { scrapeNpmRegistry } from "./parsers/npm-registry.js";
import { scrapeRedditSearch } from "./parsers/reddit-search.js";
import { startCommunityServer } from "./server.js";

export interface ProUpgradeNotice {
  status: "pro_locked";
  target: string;
  tier: "PRO";
  message: string;
  unlockUrl: string;
  includedInPro: string[];
}

export function buildProUpgradeNotice(target: string): ProUpgradeNotice {
  return {
    status: "pro_locked",
    target,
    tier: "PRO",
    message: `Target "${target}" is part of the Unscrape Pro 50-Extractor Commercial Vault. The Community Edition includes 6 starter extractors (blinkit, github-trending, hn-jobs, reddit-search, coingecko, npm-registry). Upgrade to unlock all 50 commercial extractors + Multi-Platform Arbitrage + Watchdog Daemon.`,
    unlockUrl: PRO_VAULT_URL,
    includedInPro: [
      "44 additional Indian & Global B2B/Consumer Extractors (Zepto, BigBasket, JioMart, Amazon.in, Flipkart, Myntra, Nykaa, 1mg, PharmEasy, MagicBricks, 99acres/NoBroker, Housing, NSE India, Screener, MoneyControl, IPO GMP, Gold Spot, IndiaMART, TradeIndia, Naukri, Cars24, RedBus, etc.)",
      "Multi-Platform Arbitrage Engine (compare-commerce, compare-realestate, compare-finance)",
      "Autonomous Price-Drop & Stock Watchdog Daemon (Telegram/Discord/Slack/Webhook)",
      "3 Ready-to-Import n8n Workflow Templates",
    ],
  };
}

export async function runCommunityExtractor(input: {
  target: string;
  query: string;
  city?: string;
  limit?: number;
}): Promise<unknown> {
  const t = input.target.trim().toLowerCase();
  const limit = input.limit ?? 10;
  const city = input.city ?? "bengaluru";

  switch (t) {
    case "blinkit":
      return scrapeBlinkit({ query: input.query || "amul butter", city, limit });
    case "github-trending":
    case "github":
      return scrapeGitHubTrending({ language: input.query || "typescript", limit });
    case "hn-jobs":
    case "hn":
      return scrapeHnJobs({ query: input.query || "", limit });
    case "reddit-search":
    case "reddit":
      return scrapeRedditSearch({ query: input.query || "typescript", limit });
    case "coingecko":
      return scrapeCoinGecko({ query: input.query || "", limit });
    case "npm-registry":
    case "npm":
      return scrapeNpmRegistry({ query: input.query || "playwright", limit });
    default:
      return buildProUpgradeNotice(input.target);
  }
}

const isMain = Boolean(process.argv[1]) && process.argv[1].endsWith("index.ts");
if (isMain) {
  const args = process.argv.slice(2);
  if (args[0] === "serve" || args.includes("--serve")) {
    startCommunityServer({ port: Number(process.env.PORT ?? 3000) });
  } else if (args[0] === "list" || args.includes("--list")) {
    console.log(JSON.stringify({ total: COMMUNITY_CATALOG.length, targets: COMMUNITY_CATALOG }, null, 2));
  } else {
    const target = args[0] ?? "blinkit";
    const query = args[1] ?? "";
    runCommunityExtractor({ target, query }).then((res) => {
      console.log(JSON.stringify(res, null, 2));
    });
  }
}
