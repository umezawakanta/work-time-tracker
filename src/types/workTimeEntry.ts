export interface WorkTimeEntry {
  _id?: string;
  projectName: string;
  description: string;
  startTime: string;
  endTime: string;
  duration?: number;
  date?: string;
}
