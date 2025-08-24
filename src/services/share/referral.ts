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
