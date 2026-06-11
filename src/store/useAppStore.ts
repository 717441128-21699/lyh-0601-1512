import { create } from 'zustand';
import type {
  Course,
  Question,
  Answer,
  Homework,
  Submission,
  Flashcard,
  ReportData,
  Settings,
  AnswerTone,
  MasteryLevel,
} from '../types';
import { courses } from '../data/courses';
import { questions as initialQuestions } from '../data/questions';
import { homeworks as initialHomeworks, submissions as initialSubmissions } from '../data/homework';
import { flashcards as initialFlashcards } from '../data/flashcards';
import { reportData, defaultSettings } from '../data/reports';
import { generateAIAnswer, generateComment, generateRecommendations } from '../utils/ai';

interface AppState {
  courses: Course[];
  questions: Question[];
  homeworks: Homework[];
  submissions: Submission[];
  flashcards: Flashcard[];
  reportData: ReportData[];
  settings: Settings;
  
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  
  setAnswerTone: (tone: AnswerTone) => void;
  toggleContentFilter: () => void;
  toggleAutoAnswer: () => void;
  
  addQuestionAnswer: (questionId: string, content: string, isAI: boolean, authorName?: string) => void;
  transferQuestion: (questionId: string) => void;
  blockQuestion: (questionId: string) => void;
  unblockQuestion: (questionId: string) => void;
  starQuestion: (questionId: string) => void;
  
  generateAIAnswerForQuestion: (questionId: string) => void;
  generateCommentForSubmission: (submissionId: string, score?: number) => void;
  
  updateSubmissionScore: (submissionId: string, score: number) => void;
  updateSubmissionComment: (submissionId: string, comment: string) => void;
  submitGrade: (submissionId: string) => void;
  
  updateFlashcardMastery: (flashcardId: string, level: MasteryLevel) => void;
  toggleFlashcardStar: (flashcardId: string) => void;
  getRecommendedFlashcards: () => Flashcard[];
  
  addMaterialToCourse: (courseId: string, material: string) => void;
  
  getQuestionsByCourse: (courseId: string) => Question[];
  getHomeworksByCourse: (courseId: string) => Homework[];
  getFlashcardsByCourse: (courseId: string) => Flashcard[];
  getSubmissionsByHomework: (homeworkId: string) => Submission[];
  getReportByCourse: (courseId: string) => ReportData | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  courses,
  questions: initialQuestions,
  homeworks: initialHomeworks,
  submissions: initialSubmissions,
  flashcards: initialFlashcards,
  reportData,
  settings: defaultSettings,
  
  selectedCourseId: null,
  setSelectedCourseId: (id) => set({ selectedCourseId: id }),
  
  setAnswerTone: (tone) =>
    set((state) => ({
      settings: { ...state.settings, answerTone: tone },
    })),
  
  toggleContentFilter: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        contentFilterEnabled: !state.settings.contentFilterEnabled,
      },
    })),
  
  toggleAutoAnswer: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        autoAnswerEnabled: !state.settings.autoAnswerEnabled,
      },
    })),
  
  addQuestionAnswer: (questionId, content, isAI, authorName) => {
    const newAnswer: Answer = {
      id: `a-${Date.now()}`,
      questionId,
      content,
      isAI,
      tone: get().settings.answerTone,
      createdAt: new Date().toLocaleString('zh-CN'),
      authorName,
    };
    
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: [...q.answers, newAnswer],
              status: isAI ? 'ai_answered' : 'teacher_answered',
            }
          : q
      ),
    }));
  },
  
  transferQuestion: (questionId) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, status: 'transferred' } : q
      ),
    })),
  
  blockQuestion: (questionId) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, isBlocked: true, status: 'blocked' } : q
      ),
    })),
  
  unblockQuestion: (questionId) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, isBlocked: false, status: q.answers.length > 0 ? 'ai_answered' : 'pending' } : q
      ),
    })),
  
  starQuestion: (questionId) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, isStarred: !q.isStarred } : q
      ),
    })),
  
  generateAIAnswerForQuestion: (questionId) => {
    const state = get();
    const question = state.questions.find((q) => q.id === questionId);
    if (!question) return;
    
    const answerContent = generateAIAnswer(
      question.content,
      state.settings.answerTone
    );
    
    const newAnswer: Answer = {
      id: `a-${Date.now()}`,
      questionId,
      content: answerContent,
      isAI: true,
      tone: state.settings.answerTone,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: [...q.answers, newAnswer],
              status: 'ai_answered',
            }
          : q
      ),
    }));
  },
  
  generateCommentForSubmission: (submissionId, score) => {
    const state = get();
    const submission = state.submissions.find((s) => s.id === submissionId);
    if (!submission) return;
    
    const actualScore = score ?? submission.score ?? 75;
    const comment = generateComment(
      actualScore,
      submission.studentName,
      state.settings.answerTone
    );
    
    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === submissionId
          ? { ...sub, commentDraft: comment, score: actualScore, status: 'grading' }
          : sub
      ),
    }));
  },
  
  updateSubmissionScore: (submissionId, score) =>
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId ? { ...s, score } : s
      ),
    })),
  
  updateSubmissionComment: (submissionId, comment) =>
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId ? { ...s, finalComment: comment, status: 'grading' } : s
      ),
    })),
  
  submitGrade: (submissionId) =>
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'graded',
              finalComment: s.finalComment || s.commentDraft,
            }
          : s
      ),
    })),
  
  updateFlashcardMastery: (flashcardId, level) =>
    set((state) => ({
      flashcards: state.flashcards.map((f) =>
        f.id === flashcardId
          ? { ...f, masteryLevel: level, lastReviewed: new Date().toISOString().split('T')[0], reviewCount: f.reviewCount + 1 }
          : f
      ),
    })),
  
  toggleFlashcardStar: (flashcardId) =>
    set((state) => ({
      flashcards: state.flashcards.map((f) =>
        f.id === flashcardId ? { ...f, isStarred: !f.isStarred } : f
      ),
    })),
  
  getRecommendedFlashcards: () => {
    const state = get();
    return generateRecommendations(state.flashcards, 6);
  },
  
  addMaterialToCourse: (courseId, material) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.id === courseId
          ? { ...c, materials: [...c.materials, material] }
          : c
      ),
    })),
  
  getQuestionsByCourse: (courseId) =>
    get().questions.filter((q) => q.courseId === courseId),
  
  getHomeworksByCourse: (courseId) =>
    get().homeworks.filter((h) => h.courseId === courseId),
  
  getFlashcardsByCourse: (courseId) =>
    get().flashcards.filter((f) => f.courseId === courseId),
  
  getSubmissionsByHomework: (homeworkId) =>
    get().submissions.filter((s) => s.homeworkId === homeworkId),
  
  getReportByCourse: (courseId) =>
    get().reportData.find((r) => r.courseId === courseId),
}));
