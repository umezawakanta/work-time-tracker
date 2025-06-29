export interface WorkTimeEntry {
  _id?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  projectName: string;
  description?: string;
  createdAt?: Date;
  userId: string; // この行を追加
}
