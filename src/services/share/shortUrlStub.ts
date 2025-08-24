export interface ShortUrlPayload {
  kind: 'iq' | 'mbti';
  data: Record<string, string | number | boolean>;
  issuedAt: number;
}

function generateCode(): string {
  const rand = Math.floor(Math.random() * 36 ** 6)
    .toString(36)
    .padStart(6, '0');
  return `r-${Date.now().toString(36)}${rand}`;
}

export function issueShortUrl(payload: ShortUrlPayload): { code: string; url: string } {
  const code = generateCode();
  try {
    const key = `shorturl:${code}`;
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
  const url = `${window.location.origin}/assessments?s=${encodeURIComponent(code)}`;
  return { code, url };
}

export function resolveShortUrl(code: string): ShortUrlPayload | null {
  try {
    const raw = localStorage.getItem(`shorturl:${code}`);
    return raw ? (JSON.parse(raw) as ShortUrlPayload) : null;
  } catch {
    return null;
  }
}
