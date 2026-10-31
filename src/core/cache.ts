import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface CacheOptions {
  enabled?: boolean;
  ttlSeconds?: number;
  cacheDir?: string;
}

interface CacheEnvelope<T> {
  key: string;
  target: string;
  query: string;
  createdAt: number;
  expiresAt: number;
  data: T;
}

const DEFAULT_CACHE_DIR = resolve(process.cwd(), ".unscrape-cache");
const DEFAULT_TTL_SECONDS = 300; // 5 minutes

export class LocalCache {
  private readonly cacheDir: string;
  private readonly defaultTtlSeconds: number;
  private readonly enabled: boolean;

  constructor(options: CacheOptions = {}) {
    this.cacheDir = options.cacheDir ?? DEFAULT_CACHE_DIR;
    this.defaultTtlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS;
    this.enabled = options.enabled ?? true;
  }

  private ensureDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  public buildKey(target: string, query: string, extra: Record<string, unknown> = {}): string {
    const raw = JSON.stringify({
      target: target.trim().toLowerCase(),
      query: query.trim().toLowerCase(),
      ...extra,
    });
    return createHash("sha256").update(raw).digest("hex").slice(0, 32);
  }

  private getFilePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }

  public get<T>(key: string): T | null {
    if (!this.enabled) return null;
    const filePath = this.getFilePath(key);
    if (!existsSync(filePath)) return null;

    try {
      const raw = readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw) as CacheEnvelope<T>;
      if (Date.now() > parsed.expiresAt) {
        rmSync(filePath, { force: true });
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  }

  public set<T>(
    key: string,
    target: string,
    query: string,
    data: T,
    ttlSeconds = this.defaultTtlSeconds
  ): void {
    if (!this.enabled || ttlSeconds <= 0) return;
    try {
      this.ensureDir();
      const now = Date.now();
      const envelope: CacheEnvelope<T> = {
        key,
        target,
        query,
        createdAt: now,
        expiresAt: now + ttlSeconds * 1000,
        data,
      };
      writeFileSync(this.getFilePath(key), JSON.stringify(envelope, null, 2), "utf-8");
    } catch {
      // Ignore cache write failures on read-only filesystems
    }
  }

  public clear(): void {
    if (existsSync(this.cacheDir)) {
      rmSync(this.cacheDir, { recursive: true, force: true });
    }
  }
}

/**
 * Wraps an async extractor call with transparent local disk caching.
 */
export async function withCache<T>(
  target: string,
  query: string,
  extraKeyParams: Record<string, unknown>,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<{ data: T; fromCache: boolean }> {
  const cache = new LocalCache(options);
  const key = cache.buildKey(target, query, extraKeyParams);

  if (options.enabled !== false) {
    const cached = cache.get<T>(key);
    if (cached !== null && (!Array.isArray(cached) || cached.length > 0)) {
      return { data: cached, fromCache: true };
    }
  }

  const fresh = await fetcher();
  if (!Array.isArray(fresh) || fresh.length > 0) {
    cache.set(key, target, query, fresh, options.ttlSeconds);
  }
  return { data: fresh, fromCache: false };
}
