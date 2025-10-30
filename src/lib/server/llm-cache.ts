import fs from 'fs/promises';
import path from 'path';

type CacheEntry = { value: string; expire: number };

export class LLMCache {
  private map: Map<string, CacheEntry> = new Map();
  private max: number;
  private ttlSeconds: number;
  private persistPath?: string;

  constructor(opts?: { max?: number; ttlSeconds?: number; persistPath?: string }) {
    this.max = opts?.max ?? 200;
    this.ttlSeconds = opts?.ttlSeconds ?? 60 * 60 * 6; // default 6 hours
    this.persistPath = opts?.persistPath;

    if (this.persistPath) this.loadFromDisk().catch(() => {});
  }

  private async loadFromDisk() {
    if (!this.persistPath) return;
    try {
      const raw = await fs.readFile(this.persistPath, 'utf-8');
      const arr = JSON.parse(raw) as Array<[string, CacheEntry]>;
      const now = Date.now();
      for (const [k, v] of arr) if (v.expire > now) this.map.set(k, v);
    } catch (e) {
      // ignore
    }
  }

  private async persistToDisk() {
    if (!this.persistPath) return;
    try {
      const arr = Array.from(this.map.entries());
      await fs.mkdir(path.dirname(this.persistPath), { recursive: true });
      await fs.writeFile(this.persistPath, JSON.stringify(arr), 'utf-8');
    } catch (e) {
      // ignore
    }
  }

  get(key: string): string | null {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expire) {
      this.map.delete(key);
      return null;
    }
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  async set(key: string, value: string) {
    const expire = Date.now() + this.ttlSeconds * 1000;
    this.map.set(key, { value, expire });
    if (this.map.size > this.max) {
      const first = this.map.keys().next().value;
      this.map.delete(first);
    }
    if (this.persistPath) await this.persistToDisk();
  }

  async clear() {
    this.map.clear();
    if (this.persistPath) {
      try {
        await fs.unlink(this.persistPath);
      } catch (e) {
        // ignore
      }
    }
  }
}

export const defaultLLMCache = new LLMCache({
  max: Number(process.env.LLM_CACHE_MAX) || 200,
  ttlSeconds: Number(process.env.LLM_CACHE_TTL_SECONDS) || 60 * 60 * 6,
  persistPath: process.env.LLM_CACHE_PERSIST_PATH || undefined
});
