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

export function buildShareUrl(path: string): string {
  const code = getReferralCode();
  const url = new URL(path, window.location.origin);
  if (code) url.searchParams.set('ref', code);
  url.searchParams.set('utm_source', 'share');
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
