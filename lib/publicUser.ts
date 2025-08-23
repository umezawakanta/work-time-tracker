import type { PublicUser } from '../src/types/admin';

/** Map a raw user document (mongoose or plain object) to safe PublicUser */
export function toPublicUser(raw: any): PublicUser {
  const id: string = String(raw?._id ?? raw?.id ?? '');
  const email: string = String(raw?.email ?? '');
  const name: string = String(raw?.displayName ?? raw?.username ?? raw?.name ?? '');
  const roleValue = String(raw?.role ?? 'user');
  const role = ['user', 'admin', 'manager', 'guest'].includes(roleValue)
    ? (roleValue as 'user' | 'admin' | 'manager' | 'guest')
    : 'user';
  const rolesMeta: string[] = Array.isArray(raw?.metadata?.roles)
    ? (raw.metadata.roles as string[])
    : [];
  const rolesField: string[] = Array.isArray(raw?.roles) ? (raw.roles as string[]) : [];
  const roles: string[] = Array.from(new Set([...(rolesField || []), ...(rolesMeta || [])]));
  const status: string = String(raw?.status ?? 'active');
  const isActive: boolean = status === 'active';
  const blocked: boolean = status === 'suspended';
  const lastLoginAt: string | null = raw?.lastLoginAt
    ? new Date(raw.lastLoginAt).toISOString()
    : null;
  const createdAt: string = raw?.createdAt
    ? new Date(raw.createdAt).toISOString()
    : new Date().toISOString();

  return { _id: id, email, name, role, roles, isActive, blocked, lastLoginAt, createdAt };
}

/** Map an array of user documents to PublicUser[] */
export function toPublicUsers(list: any[]): PublicUser[] {
  return (Array.isArray(list) ? list : []).map((u) => toPublicUser(u));
}

// Backward-compat wrapper name commonly used in routes
export function sanitizeUser(raw: any): PublicUser {
  return toPublicUser(raw);
}
export function sanitizeUsers(list: any[]): PublicUser[] {
  return toPublicUsers(list);
}

/**
 * Defense-in-depth: remove sensitive fields if present by mistake.
 * Mutates the given object/array to scrub keys like password/hashedPassword/salt.
 */
export function assertNoSensitiveFields(payload: unknown): void {
  const banned = new Set<string>([
    'password',
    'pass',
    'passwordhash',
    'hashedpassword',
    'hash',
    'salt',
    'credential',
    'credentials',
  ]);

  const scrub = (obj: unknown, depth = 0) => {
    if (depth > 4 || obj == null) return;
    if (Array.isArray(obj)) {
      for (const item of obj) scrub(item, depth + 1);
      return;
    }
    if (typeof obj !== 'object') return;
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const keyLc = key.toLowerCase();
      if (banned.has(keyLc)) {
        try {
          // Remove and log once per hit
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete (record as any)[key];
          console.warn(`[SECURITY] Sensitive field removed from response: ${key}`);
          continue;
        } catch {}
      }
      scrub(record[key], depth + 1);
    }
  };

  scrub(payload, 0);
}
