export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  avatar?: string;
  bio?: string;
  rating?: number;
  learningStreak?: number;
  totalPoints?: number;
  learningPreferences?: {
    topics: string[];
    difficulty: string;
  };
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  hasVideo?: boolean;
  videoDuration?: number;
  order: number;
  isFree: boolean;
}

export interface Section {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  instructor: User;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail?: string;
  sections?: Section[];
  tags: string[];
  learningOutcomes: string[];
  requirements: string[];
  totalStudents: number;
  totalLessons: number;
  totalDuration?: number;
  rating: number;
  totalRatings: number;
  status:
    "draft" | "pending" | "published" | "rejected" | "archived" | "hidden";
  adminFeedback?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: Course;
  progressPercentage: number;
  isCompleted: boolean;
  completedLessons: Array<{
    lessonId: string;
    completedAt: string;
  }>;
  lastAccessedAt: string;
  /** Certificate document _id — present once the certificate has been generated */
  certificate?: string;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  course: string;
  questions: QuizQuestion[];
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  isAdaptive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: User;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}
