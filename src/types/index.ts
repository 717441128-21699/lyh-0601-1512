export type QuestionStatus =
  | 'pending'
  | 'ai_answered'
  | 'teacher_answered'
  | 'transferred'
  | 'blocked';

export type AnswerTone = 'formal' | 'friendly' | 'encouraging';

export type MasteryLevel = 'mastered' | 'learning' | 'weak' | 'not_started';

export type SubmissionStatus = 'submitted' | 'grading' | 'graded';

export interface Course {
  id: string;
  name: string;
  description: string;
  cover: string;
  studentCount: number;
  progress: number;
  materials: string[];
  createdAt: string;
  className: string;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  isAI: boolean;
  tone: AnswerTone;
  createdAt: string;
  authorName?: string;
}

export interface Question {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  studentAvatar?: string;
  content: string;
  status: QuestionStatus;
  tags: string[];
  isBlocked: boolean;
  createdAt: string;
  answers: Answer[];
  followUpCount: number;
  isStarred?: boolean;
}

export interface Homework {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  totalCount: number;
  submittedCount: number;
  averageScore?: number;
}

export interface Submission {
  id: string;
  homeworkId: string;
  studentName: string;
  content: string;
  commentDraft: string;
  finalComment: string;
  score: number | null;
  status: SubmissionStatus;
  submittedAt: string;
}

export interface Flashcard {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  front: string;
  back: string;
  masteryLevel: MasteryLevel;
  isRecommended: boolean;
  isStarred: boolean;
  tags: string[];
  lastReviewed?: string;
  reviewCount: number;
}

export interface ConfusionItem {
  topic: string;
  count: number;
  percentage: number;
}

export interface StudentProgress {
  id: string;
  name: string;
  progress: number;
  needsHelp: boolean;
  weakTopics: string[];
  score: number;
}

export interface ReportData {
  courseId: string;
  courseName: string;
  totalQuestions: number;
  aiAnsweredRate: number;
  homeworkCompletionRate: number;
  averageScore: number;
  topConfusions: ConfusionItem[];
  studentProgress: StudentProgress[];
}

export interface Settings {
  answerTone: AnswerTone;
  contentFilterEnabled: boolean;
  blockedKeywords: string[];
  autoAnswerEnabled: boolean;
  teacherName: string;
}
