export function persistReferralFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('ref') || params.get('referral') || params.get('r');
    if (code) {
      localStorage.setItem('referral:code', code);
      return code;
    }
    return null;
  } catch {
    return null;
  }
}

export function getReferralCode(): string | null {
  try {
    return localStorage.getItem('referral:code');
  } catch {
    return null;
  }
}

export function setReferralCode(code: string | null): void {
  try {
    const key = 'referral:code';
    if (!code || String(code).trim().length === 0) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, String(code).trim());
  } catch {}
}

export function clearReferralCode(): void {
  try {
    localStorage.removeItem('referral:code');
  } catch {}
}

export function buildShareUrl(path: string): string {
  const code = getReferralCode();
  const url = new URL(path, window.location.origin);
  if (code) url.searchParams.set('ref', code);
  url.searchParams.set('utm_source', 'share');
  return url.toString();
}

export function buildShareUrlForChannel(path: string, channel: string): string {
  const code = getReferralCode();
  const url = new URL(path, window.location.origin);
  if (code) url.searchParams.set('ref', code);
  url.searchParams.set('utm_source', 'share');
  url.searchParams.set('utm_medium', channel);
  url.searchParams.set('utm_campaign', 'invite_share');
  return url.toString();
}

export function ensureOwnReferralCode(): string {
  try {
    const existing = localStorage.getItem('referral:own');
    if (existing) return existing;
    const code = `u-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('referral:own', code);
    return code;
  } catch {
    return 'u-anon';
  }
}

export function buildOwnInviteUrl(): string {
  const code = ensureOwnReferralCode();
  const url = new URL('/assessments', window.location.origin);
  url.searchParams.set('ref', code);
  url.searchParams.set('utm_source', 'share');
  return url.toString();
}
