export interface WorkTimeEntry {
  _id?: string;
  projectName: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration?: number;
  date?: string;
}
