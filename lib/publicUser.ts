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
  const roles: string[] = Array.isArray(raw?.roles) ? (raw.roles as string[]) : [];
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
