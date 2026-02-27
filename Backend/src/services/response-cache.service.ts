export interface CachedHttpResponse {
  body: string;
  contentType?: string;
  statusCode: number;
  createdAt: number;
  expiresAt: number;
  tags: string[];
}

export interface ResponseCacheStats {
  entries: number;
  hits: number;
  misses: number;
  hitRate: number;
  oldestEntryAgeMs: number;
}

class ResponseCacheService {
  private readonly entries = new Map<string, CachedHttpResponse>();
  private hits = 0;
  private misses = 0;

  get(key: string): CachedHttpResponse | null {
    const entry = this.entries.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry;
  }

  set(key: string, entry: Omit<CachedHttpResponse, 'createdAt'>): void {
    this.entries.set(key, {
      ...entry,
      createdAt: Date.now(),
    });
  }

  invalidateByTag(tag: string): number {
    let deleted = 0;
    for (const [key, entry] of this.entries) {
      if (entry.tags.includes(tag)) {
        this.entries.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  clear(): void {
    this.entries.clear();
  }

  getStats(): ResponseCacheStats {
    const totalLookups = this.hits + this.misses;
    let oldest = Number.POSITIVE_INFINITY;
    const now = Date.now();

    for (const entry of this.entries.values()) {
      const age = now - entry.createdAt;
      if (age < oldest) oldest = age;
    }

    return {
      entries: this.entries.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: totalLookups > 0 ? Number((this.hits / totalLookups).toFixed(4)) : 0,
      oldestEntryAgeMs: oldest === Number.POSITIVE_INFINITY ? 0 : oldest,
    };
  }

  buildKey(method: string, originalUrl: string, query: Record<string, unknown>): string {
    const queryString = Object.keys(query).length > 0
      ? JSON.stringify(query)
      : '';
    return `${method.toUpperCase()}::${originalUrl}::${queryString}`;
  }
}

export const responseCache = new ResponseCacheService();
