import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
  type Response,
} from "playwright";
import { resolveGeoLocation, type GeoInput, type GeoLocation } from "./geo.js";

export const USER_AGENT_POOL: readonly string[] = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
];

export const VIEWPORT_PRESETS: ReadonlyArray<{ width: number; height: number }> = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 1536, height: 864 },
  { width: 1366, height: 768 },
];

export type BlockedResourceType = "image" | "font" | "media" | "stylesheet";

export interface BrowserOptions {
  headless?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
  locale?: string;
  timezoneId?: string;
  geo?: GeoInput;
  geolocation?: { latitude: number; longitude: number };
  timeoutMs?: number;
  blockResources?: boolean;
  blockedResourceTypes?: ReadonlyArray<BlockedResourceType>;
  extraHeaders?: Record<string, string>;
}

export interface NavigationOptions {
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  timeoutMs?: number;
  retries?: number;
  referer?: string;
  waitForSelector?: string;
}

export interface CapturedJsonResponse<T = unknown> {
  url: string;
  status: number;
  headers: Record<string, string>;
  data: T;
  capturedAt: string;
}

export interface HydrationStateSnapshot {
  nextData: unknown | null;
  preloadedState: unknown | null;
  initialState: unknown | null;
  jsonLd: unknown[];
}

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  userAgent: string;
  viewport: { width: number; height: number };
  geoLocation: GeoLocation;
  navigateSafely: (url: string, options?: NavigationOptions) => Promise<Response | null>;
  close: () => Promise<void>;
}

export function getRandomUserAgent(): string {
  const index = Math.floor(Math.random() * USER_AGENT_POOL.length);
  return USER_AGENT_POOL[index] ?? USER_AGENT_POOL[0];
}

export function getRandomViewport(): { width: number; height: number } {
  const index = Math.floor(Math.random() * VIEWPORT_PRESETS.length);
  return VIEWPORT_PRESETS[index] ?? VIEWPORT_PRESETS[0];
}

export function buildStealthHeaders(
  _userAgent: string,
  extraHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    ...extraHeaders,
  };
}

/**
 * Hooks into `page.on('response')` and captures live internal XHR/Fetch JSON payloads
 * whose URL matches `urlPattern` (string substring, RegExp, or predicate).
 */
export function captureJsonResponses<T = unknown>(
  page: Page,
  urlPattern: string | RegExp | ((url: string, response: Response) => boolean) = () => true
): {
  responses: CapturedJsonResponse<T>[];
  waitForNext: (timeoutMs?: number) => Promise<CapturedJsonResponse<T> | null>;
  stop: () => void;
} {
  const responses: CapturedJsonResponse<T>[] = [];
  const waiters: Array<(item: CapturedJsonResponse<T>) => void> = [];

  const matches = (url: string, res: Response): boolean => {
    if (typeof urlPattern === "string") {
      return url.toLowerCase().includes(urlPattern.toLowerCase());
    }
    if (urlPattern instanceof RegExp) {
      return urlPattern.test(url);
    }
    return urlPattern(url, res);
  };

  const handler = async (response: Response): Promise<void> => {
    try {
      const url = response.url();
      const status = response.status();
      if (status < 200 || status >= 300) return;

      const contentType = response.headers()["content-type"] ?? "";
      const looksLikeJson =
        contentType.includes("application/json") ||
        contentType.includes("application/ld+json") ||
        url.includes(".json") ||
        url.includes("/api/") ||
        url.includes("graphql") ||
        url.includes("algolia");

      if (!looksLikeJson || !matches(url, response)) return;

      const data = (await response.json()) as T;
      const captured: CapturedJsonResponse<T> = {
        url,
        status,
        headers: response.headers(),
        data,
        capturedAt: new Date().toISOString(),
      };
      responses.push(captured);

      while (waiters.length > 0) {
        const resolveWaiter = waiters.shift();
        resolveWaiter?.(captured);
      }
    } catch {
      // Ignore non-JSON or aborted response bodies
    }
  };

  page.on("response", handler);

  return {
    responses,
    waitForNext: (timeoutMs = 8_000) =>
      new Promise<CapturedJsonResponse<T> | null>((resolvePromise) => {
        if (responses.length > 0) {
          resolvePromise(responses[responses.length - 1] ?? null);
          return;
        }
        const timer = setTimeout(() => {
          const idx = waiters.indexOf(onMatch);
          if (idx !== -1) waiters.splice(idx, 1);
          resolvePromise(null);
        }, timeoutMs);

        const onMatch = (item: CapturedJsonResponse<T>): void => {
          clearTimeout(timer);
          resolvePromise(item);
        };
        waiters.push(onMatch);
      }),
    stop: () => {
      page.off("response", handler);
    },
  };
}

/**
 * Extracts `#__NEXT_DATA__`, `window.__PRELOADED_STATE__`, `window.__INITIAL_STATE__`,
 * and all `application/ld+json` structured data scripts from an active Playwright Page.
 */
export async function extractHydrationState(page: Page): Promise<HydrationStateSnapshot> {
  return page.evaluate(() => {
    const nextEl = document.querySelector("#__NEXT_DATA__");
    let nextData: unknown | null = null;
    if (nextEl?.textContent) {
      try {
        nextData = JSON.parse(nextEl.textContent);
      } catch {
        nextData = null;
      }
    }

    const jsonLd: unknown[] = [];
    document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
      if (!el.textContent) return;
      try {
        const parsed = JSON.parse(el.textContent);
        if (Array.isArray(parsed)) {
          jsonLd.push(...parsed);
        } else {
          jsonLd.push(parsed);
        }
      } catch {
        // Ignore malformed JSON-LD blocks
      }
    });

    const win = window as unknown as Record<string, unknown>;

    return {
      nextData: nextData ?? win.__NEXT_DATA__ ?? null,
      preloadedState: win.__PRELOADED_STATE__ ?? null,
      initialState: win.__INITIAL_STATE__ ?? null,
      jsonLd,
    };
  });
}

/**
 * Creates a stealth-configured Playwright Chromium session with anti-bot evasion,
 * hyperlocal geolocation context injection, and optional resource blocking.
 */
export async function createBrowserSession(
  options: BrowserOptions = {}
): Promise<BrowserSession> {
  const {
    headless = true,
    userAgent = getRandomUserAgent(),
    viewport = getRandomViewport(),
    locale = "en-IN",
    timezoneId = "Asia/Kolkata",
    geo = "bengaluru",
    geolocation,
    timeoutMs = 30_000,
    blockResources = false,
    blockedResourceTypes = ["image", "font", "media"],
    extraHeaders = {},
  } = options;

  const resolvedGeo = resolveGeoLocation(geo);
  const coords = geolocation ?? {
    latitude: resolvedGeo.lat,
    longitude: resolvedGeo.lon,
  };

  const stealthHeaders = buildStealthHeaders(userAgent, extraHeaders);

  const launchArgs = [
    "--disable-blink-features=AutomationControlled",
    "--disable-features=IsolateOrigins,site-per-process",
    "--disable-infobars",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
  ];

  if (headless) {
    launchArgs.unshift("--headless=new");
  }

  const browser = await chromium.launch({
    headless: false,
    args: launchArgs,
  });

  const context = await browser.newContext({
    userAgent,
    viewport,
    locale,
    timezoneId,
    geolocation: coords,
    permissions: ["geolocation"],
    extraHTTPHeaders: stealthHeaders,
  });

  await context.grantPermissions(["geolocation"]).catch(() => {});
  await context.setGeolocation(coords).catch(() => {});

  // Anti-bot stealth init script
  await context.addInitScript(
    (loc) => {
      const win = window as unknown as Record<string, unknown>;
      win.__name = (fn: unknown) => fn;

      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });

      Object.defineProperty(navigator, "languages", {
        get: () => ["en-IN", "en-GB", "en-US", "en"],
      });

      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });

      if (!win.chrome) {
        win.chrome = { runtime: {} };
      }

      try {
        const locationData = JSON.stringify({
          lat: loc.lat,
          lon: loc.lon,
          pincode: loc.pincode,
          locality: loc.locality,
          city: loc.city,
        });
        window.localStorage.setItem("location", locationData);
        window.localStorage.setItem("user_location", locationData);
      } catch {
        // Ignore storage errors on about:blank
      }
    },
    resolvedGeo
  );

  const page = await context.newPage();
  page.setDefaultTimeout(timeoutMs);
  page.setDefaultNavigationTimeout(timeoutMs);

  if (blockResources && blockedResourceTypes.length > 0) {
    const blockedSet = new Set<string>(blockedResourceTypes);
    await page.route("**/*", (route) => {
      const resourceType = route.request().resourceType();
      if (blockedSet.has(resourceType)) {
        return route.abort();
      }
      return route.continue();
    });
  }

  const navigateSafely = async (
    url: string,
    navOptions: NavigationOptions = {}
  ): Promise<Response | null> => {
    const {
      waitUntil = "domcontentloaded",
      timeoutMs: navTimeout = timeoutMs,
      retries = 2,
      referer,
      waitForSelector,
    } = navOptions;

    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await page.goto(url, {
          waitUntil,
          timeout: navTimeout,
          referer,
        });

        if (waitForSelector) {
          await page
            .waitForSelector(waitForSelector, { timeout: Math.min(navTimeout, 10_000) })
            .catch(() => null);
        }

        return response;
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          await page.waitForTimeout(500 * (attempt + 1));
        }
      }
    }

    throw new Error(
      `Safe navigation to ${url} failed after ${retries + 1} attempts: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  };

  return {
    browser,
    context,
    page,
    userAgent,
    viewport,
    geoLocation: resolvedGeo,
    navigateSafely,
    close: async () => {
      await page.close().catch(() => {});
      await context.close().catch(() => {});
      await browser.close().catch(() => {});
    },
  };
}

export async function withPage<T>(
  task: (page: Page, session: BrowserSession) => Promise<T>,
  options: BrowserOptions = {}
): Promise<T> {
  const session = await createBrowserSession(options);
  try {
    return await task(session.page, session);
  } finally {
    await session.close();
  }
}

export class StealthBrowser {
  private readonly defaultOptions: BrowserOptions;

  constructor(defaultOptions: BrowserOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  public async launchSession(overrides: BrowserOptions = {}): Promise<BrowserSession> {
    return createBrowserSession({ ...this.defaultOptions, ...overrides });
  }

  public async withPage<T>(
    task: (page: Page, session: BrowserSession) => Promise<T>,
    overrides: BrowserOptions = {}
  ): Promise<T> {
    return withPage(task, { ...this.defaultOptions, ...overrides });
  }
}

export const BrowserManager = StealthBrowser;
