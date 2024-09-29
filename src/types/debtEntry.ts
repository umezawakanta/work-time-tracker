export interface DebtEntry {
  _id?: string;
  date: string;
  value: number;
  description: string;
  account: string;
  createdAt?: Date;
}
