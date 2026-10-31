import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { resolve } from "node:path";
import { COMMUNITY_CATALOG, PRO_VAULT_URL } from "./catalog.js";
import { buildProUpgradeNotice, runCommunityExtractor } from "./index.js";

export function startCommunityServer(options: { port?: number } = {}): Server {
  const port = options.port ?? 3000;
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    if (url.pathname === "/" || url.pathname === "/landing") {
      const html = readFileSync(resolve(process.cwd(), "site/index.html"), "utf-8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }
    if (url.pathname === "/api/targets") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify(
          {
            edition: "community",
            proVaultUrl: PRO_VAULT_URL,
            freeCount: 6,
            proCount: 44,
            totalExtractors: COMMUNITY_CATALOG.length,
            targets: COMMUNITY_CATALOG,
          },
          null,
          2
        )
      );
      return;
    }
    if (url.pathname.startsWith("/api/scrape/")) {
      const target = decodeURIComponent(url.pathname.replace("/api/scrape/", "")).trim();
      const query = url.searchParams.get("q") ?? "";
      const city = url.searchParams.get("city") ?? "bengaluru";
      const limit = Number(url.searchParams.get("limit") ?? 10);
      const data = await runCommunityExtractor({ target, query, city, limit });
      const isProLocked =
        data && typeof data === "object" && (data as Record<string, unknown>).status === "pro_locked";
      res.writeHead(isProLocked ? 402 : 200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(data, null, 2));
      return;
    }
    if (url.pathname.startsWith("/api/compare/")) {
      res.writeHead(402, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(buildProUpgradeNotice("compare-" + url.pathname.replace("/api/compare/", "")), null, 2));
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });
  server.listen(port);
  return server;
}
