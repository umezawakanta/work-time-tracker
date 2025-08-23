// Public user representation returned by admin APIs
// Dates are ISO8601 strings for transport consistency
export interface PublicUser {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'manager' | 'guest';
  roles: string[];
  isActive: boolean;
  blocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
