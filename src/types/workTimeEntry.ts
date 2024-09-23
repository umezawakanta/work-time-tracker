export interface WorkTimeEntry {
  _id?: string;
  projectName: string;
  description: string;
  startTime: Date | string;
  endTime: Date | string;
  duration?: number;
  date?: string;
}
