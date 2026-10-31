# ⚡ Unscrape (`unscrape-sdk`) v4.0

**Stop paying $99/month for brittle cloud scrapers.**  
**Unscrape** is an industrial-grade, local-first TypeScript scraping SDK and pre-computed **50-Extractor Commercial Vault** with built-in hyperlocal city pin-code spoofing, network XHR/Fetch interception, multi-platform arbitrage, an autonomous price-drop watchdog daemon, a dark-mode Studio Web UI + REST API, ready-to-import **n8n workflow templates**, and a **Model Context Protocol (MCP)** server for Claude Code / Cursor / OpenCode.

---

## Key Capabilities

- **50 Live-Verified Commercial Extractors (`50/50 PASS`)**: Pre-reversed against internal JSON endpoints (`page.on('response')`), `#__NEXT_DATA__`, `window.__PRELOADED_STATE__`, and `application/ld+json`.
- **Hyperlocal Dark-Store Geolocation Spoofing (`src/core/geo.ts`)**: Built-in coordinate & pin-code presets (`bengaluru` `560001`, `mumbai` `400001`, `delhi` `110001`, `hyderabad` `500001`, `pune` `411001`, `chennai` `600001`, `kolkata` `700001`).
- **Multi-Platform Arbitrage Engine (`src/core/compare.ts`)**: Run one command to compare prices, stock, and delivery ETAs across **Blinkit, Zepto, BigBasket/JioMart, Amazon India, and Flipkart** simultaneously.
- **Autonomous Price-Drop & Stock Watchdog Daemon (`src/core/monitor.ts`)**: Stateful snapshot diffing engine firing instant **Telegram, Discord, Slack, or n8n Webhook** alerts on price drops, stock transitions, and new listings.
- **Local REST API + Studio Web Playground (`src/server.ts`)**: Zero-dependency HTTP server (`http://localhost:3000`) with an interactive dark-mode UI and `/landing` sales page (`site/index.html`).
- **Model Context Protocol (MCP) Server (`src/mcp.ts`)**: Standard JSON-RPC 2.0 `stdio` server exposing all 50 extractors and arbitrage engines directly to AI coding agents.

---

## Quick Start

```bash
npm install
npx playwright install chromium

# Verify all 50 extractors live against the internet
npm run verify
```

### 1. CLI Usage

```bash
# Scrape any of the 50 targets with city pin-code spoofing
npx tsx src/index.ts blinkit "amul butter" --city bengaluru --limit 10
npx tsx src/index.ts zepto "amul butter" --city mumbai --format table
npx tsx src/index.ts nseindia "NIFTY 50" --limit 10
npx tsx src/index.ts chittorgarh-ipo --limit 10
npx tsx src/index.ts indiamart "solar panels" --limit 10

# Multi-Platform Arbitrage Comparisons
npx tsx src/index.ts compare-commerce "amul butter" --city bengaluru
npx tsx src/index.ts compare-realestate "bengaluru"
npx tsx src/index.ts compare-finance "RELIANCE"

# Autonomous Price-Drop & Stock Watchdog
npx tsx src/index.ts watch --target blinkit --query "amul butter" --city bengaluru --once

# Launch Studio UI (/) + Launch Marketing Page (/landing) + REST API
npx tsx src/index.ts serve --port 3000
```

### 2. TypeScript SDK Usage

```ts
import {
  compareCommerce,
  scrapeBlinkit,
  scrapeNse,
  scrapeChittorgarhIpo,
} from "unscrape-sdk";

const arbitrage = await compareCommerce("amul butter", { city: "bengaluru" });
console.log("Cheapest option:", arbitrage.cheapestOption);

const niftyQuotes = await scrapeNse("NIFTY 50", 10);
const liveIpos = await scrapeChittorgarhIpo({ limit: 10 });
```

### 3. MCP Server Configuration (Claude Desktop / Cursor / OpenCode)

```json
{
  "mcpServers": {
    "unscrape": {
      "command": "npx",
      "args": ["tsx", "/Users/deveshkolte/unscrape-sdk/src/mcp.ts"]
    }
  }
}
```

---

## The 50-Extractor Commercial Vault (`50/50 PASS`)

| Category | Extractors Included |
| :--- | :--- |
| **Quick-Commerce & Grocery (5)** | `blinkit`, `zepto`, `bigbasket`, `jiomart`, `swiggy-instamart` |
| **E-Commerce & Retail (9)** | `amazon-in`, `flipkart`, `myntra`, `nykaa`, `meesho`, `croma`, `reliancedigital`, `ajio`, `firstcry` |
| **Healthcare & Pharma (3)** | `1mg`, `pharmeasy`, `apollo247` |
| **B2B Wholesale (2)** | `indiamart`, `tradeindia` |
| **Food, Events, Auto & Travel (9)** | `zomato`, `bookmyshow`, `cars24`, `spinny`, `bikewale`, `olx-in`, `ixigo`, `redbus`, `makemytrip-hotels` |
| **Real Estate (3)** | `magicbricks`, `99acres`, `housing` |
| **Finance, IPOs, Gold & Crypto (7)** | `nseindia`, `screener`, `moneycontrol`, `groww-mf`, `chittorgarh-ipo`, `goodreturns-gold`, `coingecko` |
| **Jobs, Startups & AI (12)** | `naukri`, `hn-jobs`, `remoteok`, `yc-companies`, `producthunt`, `reddit-search`, `github-trending`, `npm-registry`, `huggingface-models`, `arxiv-ai`, `pypi-packages`, `dockerhub-images` |
