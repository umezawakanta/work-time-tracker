export interface Course {
  id: string;
  title: string;
  level: string; // e.g., 入門/実践/上級
  tags: string[];
}

export interface CourseProgress {
  courseId: string;
  progress: number; // 0..100
  nextLessonTitle?: string;
}
