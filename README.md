<div align="center">

# Unscrape SDK

**Local-First TypeScript Scraping SDK, 50-Extractor Commercial Vault & Model Context Protocol (MCP) Server**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Stealth_Engine-2EAD33?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev/)
[![MCP](https://img.shields.io/badge/MCP-JSON--RPC_2.0_stdio-10b981?style=flat-square)](#3-model-context-protocol-mcp-server)
[![Extractors](https://img.shields.io/badge/Commercial_Vault-50%2F50_Passing-brightgreen?style=flat-square)](#the-50-extractor-commercial-vault)

</div>

---

## Overview

**Unscrape** is a local-first TypeScript data extraction SDK, multi-platform arbitrage engine, and **Model Context Protocol (MCP)** server engineered for reliability against modern JavaScript-heavy platforms.

Instead of relying on brittle CSS selectors that break on every UI deployment, Unscrape intercepts runtime **XHR/Fetch network responses (`page.on('response')`), Next.js hydration payloads (`#__NEXT_DATA__`), Redux preloaded states (`window.__PRELOADED_STATE__`), and `application/ld+json` schemas**, paired with hyperlocal dark-store GPS and pin-code spoofing across 7 Indian metropolitan regions.

---

## System Architecture

```text
  [AI Agent (Claude Code / Cursor / OpenCode)]     [TypeScript SDK / CLI / Studio UI]
                       │                                           │
            JSON-RPC 2.0 (stdio)                           Direct Function Call
                       ▼                                           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                        Unscrape Core Runtime (src/index.ts)                     │
  ├──────────────────────────┬───────────────────────────┬──────────────────────────┤
  │  Hyperlocal Geo Spoofer  │  Multi-Platform Arbitrage │  Stateful Watchdog       │
  │  (src/core/geo.ts)       │  (src/core/compare.ts)    │  (src/core/monitor.ts)   │
  │  7 Metro GPS & Pin Codes │  Concurrent Price/ETA Diff│  Snapshot Diff + Webhooks│
  └──────────────────────────┴─────────────┬─────────────┴──────────────────────────┘
                                           │
                                           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                 StealthBrowser & Payload Interceptor (src/core/browser.ts)      │
  │   • Network XHR / Fetch JSON Interception    • #__NEXT_DATA__ Hydration Parser  │
  │   • window.__PRELOADED_STATE__ Extraction    • application/ld+json Structured   │
  └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Capabilities

- **50 Live-Verified Commercial Extractors (`50/50 PASS`)**: Pre-built extractors across Quick-Commerce, E-Commerce, Equities/IPOs, Real Estate, Healthcare, B2B Wholesale, Travel, and Developer Platforms.
- **Model Context Protocol (MCP) Server (`src/mcp.ts`)**: Standard JSON-RPC 2.0 `stdio` server exposing all extractors and cross-platform comparison engines as structured tools for AI coding agents.
- **Hyperlocal Dark-Store Geolocation Spoofing (`src/core/geo.ts`)**: Built-in coordinate and pin-code presets for **Bengaluru (`560001`), Mumbai (`400001`), Delhi (`110001`), Hyderabad (`500001`), Pune (`411001`), Chennai (`600001`), and Kolkata (`700001`)**.
- **Concurrent Multi-Platform Arbitrage (`src/core/compare.ts`)**: Compare real-time item prices, stock availability, and delivery ETAs simultaneously across **Blinkit, Zepto, BigBasket/JioMart, Amazon India, and Flipkart**.
- **Stateful Price-Drop & Stock Watchdog (`src/core/monitor.ts`)**: Snapshot-diffing daemon dispatching instant alerts to **Telegram, Discord, Slack, or n8n Webhooks** on price drops or inventory restocks.

---

## Quick Start

```bash
git clone https://github.com/deveshkolte/unscrape.git
cd unscrape
npm install
npx playwright install chromium

# Run live verification across all 50 commercial extractors
npm run verify
```

### 1. TypeScript SDK Usage

```ts
import {
  compareCommerce,
  scrapeBlinkit,
  scrapeNse,
  scrapeChittorgarhIpo,
} from "unscrape-sdk";

// Concurrent price & ETA arbitrage across quick-commerce platforms
const arbitrage = await compareCommerce("amul butter", { city: "bengaluru" });
console.log("Cheapest option:", arbitrage.cheapestOption);

// Financial & market data extraction
const niftyQuotes = await scrapeNse("NIFTY 50", 10);
const liveIpos = await scrapeChittorgarhIpo({ limit: 10 });
```

### 2. CLI Usage

```bash
# Run individual extractors with hyperlocal city pin-code spoofing
npx tsx src/index.ts blinkit "amul butter" --city bengaluru --limit 10
npx tsx src/index.ts zepto "amul butter" --city mumbai --format table
npx tsx src/index.ts nseindia "NIFTY 50" --limit 10

# Run multi-platform arbitrage comparisons
npx tsx src/index.ts compare-commerce "amul butter" --city bengaluru
npx tsx src/index.ts compare-realestate "bengaluru"
npx tsx src/index.ts compare-finance "RELIANCE"

# Start autonomous price-drop watchdog
npx tsx src/index.ts watch --target blinkit --query "amul butter" --city bengaluru --once

# Launch local REST API + Studio Web Playground (http://localhost:3000)
npx tsx src/index.ts serve --port 3000
```

### 3. Model Context Protocol (MCP) Server

Add Unscrape to your Claude Desktop, Cursor, or OpenCode MCP configuration:

```json
{
  "mcpServers": {
    "unscrape": {
      "command": "npx",
      "args": ["tsx", "/path/to/unscrape/src/mcp.ts"]
    }
  }
}
```

Exposed MCP tools:
- `unscrape_list_targets` — Lists all verified extractors and schemas.
- `unscrape_run` — Executes any target extractor with city pin-code spoofing.
- `unscrape_compare_commerce` — Concurrent price/stock/ETA arbitrage across Blinkit, Zepto, BigBasket, Amazon, and Flipkart.
- `unscrape_compare_finance` — Cross-verifies live equity metrics across NSE India, Screener.in, and MoneyControl.
- `unscrape_compare_realestate` — Compares property listings across MagicBricks, 99acres, and Housing.com.

---

## The 50-Extractor Commercial Vault

| Category | Verified Extractors (`50/50 PASS`) |
| :--- | :--- |
| **Quick-Commerce & Grocery (5)** | `blinkit`, `zepto`, `bigbasket`, `jiomart`, `swiggy-instamart` |
| **E-Commerce & Retail (9)** | `amazon-in`, `flipkart`, `myntra`, `nykaa`, `meesho`, `croma`, `reliancedigital`, `ajio`, `firstcry` |
| **Finance, Equities & IPOs (7)** | `nseindia`, `screener`, `moneycontrol`, `groww-mf`, `chittorgarh-ipo`, `goodreturns-gold`, `coingecko` |
| **Real Estate (3)** | `magicbricks`, `99acres`, `housing` |
| **Healthcare & Pharma (3)** | `1mg`, `pharmeasy`, `apollo247` |
| **B2B Wholesale (2)** | `indiamart`, `tradeindia` |
| **Food, Auto, Events & Travel (9)** | `zomato`, `bookmyshow`, `cars24`, `spinny`, `bikewale`, `olx-in`, `ixigo`, `redbus`, `makemytrip-hotels` |
| **Jobs, Startups & AI Ecosystems (12)** | `naukri`, `hn-jobs`, `remoteok`, `yc-companies`, `producthunt`, `reddit-search`, `github-trending`, `npm-registry`, `huggingface-models`, `arxiv-ai`, `pypi-packages`, `dockerhub-images` |

---

## License

MIT License — Created by **[Devesh Kolte](https://github.com/deveshkolte)**.
