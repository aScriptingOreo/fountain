import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'llm');
const DEFAULT_TTL = Number(process.env.LLM_FILE_CACHE_TTL_SECONDS) || 60 * 60 * 24 * 30; // 30 days

async function ensureDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function filePathForKey(key: string) {
  return path.join(CACHE_DIR, `${key}.json`);
}

export async function getCachedJSON(key: string): Promise<any | null> {
  const fp = filePathForKey(key);
  try {
    const raw = await fs.readFile(fp, 'utf-8');
    const obj = JSON.parse(raw);
    const now = Math.floor(Date.now() / 1000);
    const created = obj.createdAt || 0;
    const ttl = obj.ttl || DEFAULT_TTL;
    if (now - created > ttl) {
      try { await fs.unlink(fp); } catch (e) {}
      return null;
    }
    return obj.value;
  } catch (e) {
    return null;
  }
}

export async function setCachedJSON(key: string, value: any, ttlSeconds?: number) {
  await ensureDir();
  const fp = filePathForKey(key);
  const entry = { createdAt: Math.floor(Date.now() / 1000), ttl: ttlSeconds || DEFAULT_TTL, value };
  await fs.writeFile(fp, JSON.stringify(entry, null, 2), 'utf-8');
}

export async function clearFileCache() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    await Promise.all(files.map(f => fs.unlink(path.join(CACHE_DIR, f))));
  } catch (e) {
    // ignore
  }
}
