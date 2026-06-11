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

export interface ReferenceDetail {
  name: string;
  excerpts: string[];
  isNew?: boolean;
}

export interface ChatMessage {
  id: string;
  questionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  authorName?: string;
  tone?: AnswerTone;
  references?: string[];
  referenceDetails?: ReferenceDetail[];
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
  noObviousWeakness: boolean;
  learningPoints: string[];
}

export interface Settings {
  answerTone: AnswerTone;
  contentFilterEnabled: boolean;
  blockedKeywords: string[];
  autoAnswerEnabled: boolean;
  teacherName: string;
}

export type RecommendReason = 'weak_point' | 'recent_question' | 'homework_mistake' | 'forgotten';

export interface RecommendedFlashcard {
  flashcard: Flashcard;
  reasons: RecommendReason[];
  priority: number;
}

export type GuidanceRecordType = 'review' | 'qa_help' | 'homework_comment' | 'one_on_one';

export interface GuidanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  type: GuidanceRecordType;
  content: string;
  relatedFlashcardIds?: string[];
  relatedQuestionId?: string;
  relatedSubmissionId?: string;
  createdAt: string;
  createdBy: string;
}

export interface HomeworkMistake {
  studentId: string;
  homeworkId: string;
  knowledgePoints: string[];
  description: string;
}

export interface Student {
  id: string;
  name: string;
  courseIds: string[];
  avatar?: string;
  lastQuestionAt?: string;
}

export interface ReviewPlanItem {
  id: string;
  flashcardId: string;
  courseId: string;
  courseName: string;
  knowledgePoint: string;
  priority: number;
  deadline: string;
  completed: boolean;
  completedAt?: string;
  masteryLevel?: MasteryLevel;
}

export interface ReviewPlan {
  id: string;
  studentId: string;
  studentName: string;
  items: ReviewPlanItem[];
  createdAt: string;
  weekStart: string;
  weekEnd: string;
  completedCount: number;
  totalCount: number;
}
