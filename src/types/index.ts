export type QuestionStatus =
  | 'pending'
  | 'ai_answered'
  | 'teacher_answered'
  | 'transferred'
  | 'blocked';

export type AnswerTone = 'formal' | 'friendly' | 'encouraging';

export type MasteryLevel = 'mastered' | 'learning' | 'weak' | 'not_started';

export type SubmissionStatus = 'submitted' | 'grading' | 'graded';

export type MessageRole = 'student' | 'ai' | 'teacher';

export type MaterialStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface CourseMaterial {
  id: string;
  courseId: string;
  name: string;
  type: 'pdf' | 'doc' | 'ppt' | 'video' | 'other';
  size: string;
  status: MaterialStatus;
  uploadedAt: string;
  processedAt?: string;
  relatedQuestions: number;
  progress?: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  cover: string;
  studentCount: number;
  progress: number;
  materials: string[];
  materialList: CourseMaterial[];
  createdAt: string;
  className: string;
}

export interface ChatMessage {
  id: string;
  questionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  authorName?: string;
  tone?: AnswerTone;
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
  messages: ChatMessage[];
  isStarred?: boolean;
  knowledgePoints: string[];
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
  gradedAt?: string;
}

export interface Flashcard {
  id: string;
  courseId: string;
  courseName: string;
  front: string;
  back: string;
  knowledgePoints: string[];
  masteryLevel: MasteryLevel;
  isStarred: boolean;
  createdAt: string;
  lastReviewed?: string;
  reviewCount: number;
  sourceQuestionId?: string;
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
  weakPoints: string[];
  avgMastery: number;
}

export interface Settings {
  answerTone: AnswerTone;
  contentFilterEnabled: boolean;
  blockedKeywords: string[];
  autoAnswerEnabled: boolean;
  teacherName: string;
}
