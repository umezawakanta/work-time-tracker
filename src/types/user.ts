export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserAccount extends User {
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: Date;
  };
}