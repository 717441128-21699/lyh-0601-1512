import { create } from 'zustand';
import type {
  Course,
  Question,
  Homework,
  Submission,
  Flashcard,
  ReportData,
  Settings,
  AnswerTone,
  MasteryLevel,
  ChatMessage,
  MessageRole,
  CourseMaterial,
  Student,
  RecommendedFlashcard,
  RecommendReason,
  GuidanceRecord,
  GuidanceRecordType,
  ReviewPlan,
  ReviewPlanItem,
  ReferenceDetail,
} from '../types';
import { courses } from '../data/courses';
import { questions as initialQuestions } from '../data/questions';
import { homeworks as initialHomeworks, submissions as initialSubmissions } from '../data/homework';
import { flashcards as initialFlashcards } from '../data/flashcards';
import { reportData as initialReportData, defaultSettings } from '../data/reports';
import { students as initialStudents } from '../data/students';
import { guidanceRecords as initialGuidanceRecords } from '../data/guidanceRecords';
import { generateAIAnswer, generateComment, generateRecommendations, generateMaterialExcerpts } from '../utils/ai';

interface AppState {
  courses: Course[];
  questions: Question[];
  homeworks: Homework[];
  submissions: Submission[];
  flashcards: Flashcard[];
  reportData: ReportData[];
  settings: Settings;
  students: Student[];
  guidanceRecords: GuidanceRecord[];
  reviewPlans: ReviewPlan[];

  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;

  setAnswerTone: (tone: AnswerTone) => void;
  toggleContentFilter: () => void;
  toggleAutoAnswer: () => void;
  addBlockedKeyword: (keyword: string) => void;
  removeBlockedKeyword: (keyword: string) => void;

  addMessage: (questionId: string, role: MessageRole, content: string, authorName?: string) => void;
  transferQuestion: (questionId: string) => void;
  blockQuestion: (questionId: string) => void;
  unblockQuestion: (questionId: string) => void;
  toggleQuestionStar: (questionId: string) => void;
  replyAsTeacher: (questionId: string, content: string) => void;

  generateAIAnswerForQuestion: (questionId: string) => void;

  generateCommentForSubmission: (submissionId: string, score?: number) => void;
  updateSubmissionScore: (submissionId: string, score: number) => void;
  updateSubmissionComment: (submissionId: string, comment: string) => void;
  submitGrade: (submissionId: string) => void;
  getHomeworkCompletionRate: (homeworkId: string) => number;

  updateFlashcardMastery: (flashcardId: string, level: MasteryLevel) => void;
  toggleFlashcardStar: (flashcardId: string) => void;
  getRecommendedFlashcards: (courseId?: string) => Flashcard[];
  getStarredQuestions: () => Question[];
  convertQuestionToFlashcard: (questionId: string) => Flashcard | null;

  addMaterialToCourse: (courseId: string, material: CourseMaterial) => void;
  updateMaterialStatus: (materialId: string, status: CourseMaterial['status'], courseId: string) => void;

  getQuestionsByCourse: (courseId: string) => Question[];
  getHomeworksByCourse: (courseId: string) => Homework[];
  getFlashcardsByCourse: (courseId: string) => Flashcard[];
  getSubmissionsByHomework: (homeworkId: string) => Submission[];
  getReportByCourse: (courseId: string) => ReportData | undefined;
  refreshReportWeakPoints: (courseId: string) => void;
  refreshAllReportWeakPoints: () => void;

  getStudentRecommendations: (studentId: string, courseId?: string) => RecommendedFlashcard[];
  markStudentReviewComplete: (studentId: string, flashcardId: string, masteryLevel: MasteryLevel) => void;

  generateWeeklyPlan: (studentId: string) => ReviewPlan | null;
  completePlanItem: (planId: string, itemId: string, masteryLevel: MasteryLevel) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  courses,
  questions: initialQuestions,
  homeworks: initialHomeworks,
  submissions: initialSubmissions,
  flashcards: initialFlashcards,
  reportData: initialReportData,
  settings: defaultSettings,
  students: initialStudents,
  guidanceRecords: initialGuidanceRecords,
  reviewPlans: [],

  selectedCourseId: null,
  setSelectedCourseId: (id) => set({ selectedCourseId: id }),

  setAnswerTone: (tone) =>
    set((state) => ({
      settings: { ...state.settings, answerTone: tone },
    })),

  toggleContentFilter: () =>
    set((state) => {
      const newEnabled = !state.settings.contentFilterEnabled;
      let questions = state.questions;
      if (newEnabled) {
        questions = state.questions.map((q) => {
          if (state.settings.blockedKeywords.some((kw) => q.content.toLowerCase().includes(kw.toLowerCase()))) {
            return { ...q, isBlocked: true, status: 'blocked' as const };
          }
          return q;
        });
      } else {
        questions = state.questions.map((q) => {
          if (q.isBlocked) {
            const hasReply = q.messages.filter((m) => m.role !== 'student').length > 0;
            return { ...q, isBlocked: false, status: hasReply ? ('ai_answered' as const) : ('pending' as const) };
          }
          return q;
        });
      }
      return {
        settings: { ...state.settings, contentFilterEnabled: newEnabled },
        questions,
      };
    }),

  toggleAutoAnswer: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        autoAnswerEnabled: !state.settings.autoAnswerEnabled,
      },
    })),

  addBlockedKeyword: (keyword) =>
    set((state) => {
      if (state.settings.blockedKeywords.includes(keyword)) return {};
      const newBlocked = [...state.settings.blockedKeywords, keyword];
      localStorage.setItem('ai-assistant-blocked-keywords', JSON.stringify(newBlocked));
      const shouldBlock = (q: Question) =>
        newBlocked.some((kw) => q.content.toLowerCase().includes(kw.toLowerCase()));
      return {
        settings: { ...state.settings, blockedKeywords: newBlocked },
        questions: state.settings.contentFilterEnabled
          ? state.questions.map((q) =>
              shouldBlock(q) ? { ...q, isBlocked: true, status: 'blocked' as const } : q
            )
          : state.questions,
      };
    }),

  removeBlockedKeyword: (keyword) =>
    set((state) => {
      const newBlocked = state.settings.blockedKeywords.filter((k) => k !== keyword);
      localStorage.setItem('ai-assistant-blocked-keywords', JSON.stringify(newBlocked));
      const shouldUnblock = (q: Question) =>
        q.content.toLowerCase().includes(keyword.toLowerCase()) &&
        q.isBlocked &&
        !newBlocked.some((kw) => q.content.toLowerCase().includes(kw.toLowerCase()));
      return {
        settings: { ...state.settings, blockedKeywords: newBlocked },
        questions: state.settings.contentFilterEnabled
          ? state.questions.map((q) =>
              shouldUnblock(q)
                ? {
                    ...q,
                    isBlocked: false,
                    status: q.messages.filter((m) => m.role !== 'student').length > 0
                      ? ('ai_answered' as const)
                      : ('pending' as const),
                  }
                : q
            )
          : state.questions,
      };
    }),

  addMessage: (questionId, role, content, authorName) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      questionId,
      role,
      content,
      createdAt: new Date().toLocaleString('zh-CN'),
      authorName,
      tone: get().settings.answerTone,
    };

    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              messages: [...q.messages, newMessage],
              status:
                role === 'teacher'
                  ? 'teacher_answered'
                  : role === 'ai'
                    ? 'ai_answered'
                    : q.status,
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
        q.id === questionId
          ? {
              ...q,
              isBlocked: false,
              status: q.messages.filter((m) => m.role !== 'student').length > 0 ? 'ai_answered' : 'pending',
            }
          : q
      ),
    })),

  toggleQuestionStar: (questionId) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, isStarred: !q.isStarred } : q
      ),
    })),

  replyAsTeacher: (questionId, content) => {
    get().addMessage(questionId, 'teacher', content, '张老师');
  },

  generateAIAnswerForQuestion: (questionId) => {
    const state = get();
    const question = state.questions.find((q) => q.id === questionId);
    if (!question) return;

    const course = state.courses.find((c) => c.id === question.courseId);
    const readyMaterialObjects = course?.materialList
      .filter((m) => m.status === 'ready') || [];
    const readyMaterialNames = readyMaterialObjects.map((m) => m.name);

    const lastStudentMsg = [...question.messages].reverse().find((m) => m.role === 'student');
    const questionContent = lastStudentMsg?.content || question.content;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newMaterialNames = readyMaterialObjects
      .filter((m) => m.processedAt && new Date(m.processedAt) > sevenDaysAgo)
      .map((m) => m.name);

    const answerContent = generateAIAnswer(
      questionContent,
      state.settings.answerTone,
      readyMaterialNames,
      newMaterialNames
    );

    const referenceDetails: ReferenceDetail[] = readyMaterialObjects.map((m) => ({
      name: m.name,
      excerpts: generateMaterialExcerpts(m.name, questionContent),
      isNew: m.processedAt ? new Date(m.processedAt) > sevenDaysAgo : false,
    }));

    const selectedRefs = readyMaterialNames.length > 0
      ? [...readyMaterialNames].sort(() => Math.random() - 0.5).slice(0, 3)
      : undefined;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      questionId,
      role: 'ai',
      content: answerContent,
      createdAt: new Date().toLocaleString('zh-CN'),
      tone: state.settings.answerTone,
      references: selectedRefs,
      referenceDetails: referenceDetails.length > 0 ? referenceDetails : undefined,
    };

    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              messages: [...q.messages, newMessage],
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
              gradedAt: new Date().toLocaleString('zh-CN'),
            }
          : s
      ),
    })),

  getHomeworkCompletionRate: (homeworkId) => {
    const state = get();
    const subs = state.submissions.filter((s) => s.homeworkId === homeworkId);
    if (subs.length === 0) return 0;
    const graded = subs.filter((s) => s.status === 'graded').length;
    return Math.round((graded / subs.length) * 100);
  },

  updateFlashcardMastery: (flashcardId, level) => {
    set((state) => ({
      flashcards: state.flashcards.map((f) =>
        f.id === flashcardId
          ? {
              ...f,
              masteryLevel: level,
              lastReviewed: new Date().toISOString().split('T')[0],
              reviewCount: f.reviewCount + 1,
            }
          : f
      ),
    }));
    const card = get().flashcards.find((f) => f.id === flashcardId);
    if (card) {
      get().refreshReportWeakPoints(card.courseId);
    }
  },

  toggleFlashcardStar: (flashcardId) =>
    set((state) => ({
      flashcards: state.flashcards.map((f) =>
        f.id === flashcardId ? { ...f, isStarred: !f.isStarred } : f
      ),
    })),

  getRecommendedFlashcards: (courseId) => {
    const state = get();
    let cards = state.flashcards;
    if (courseId) {
      cards = cards.filter((f) => f.courseId === courseId);
    }
    return generateRecommendations(cards, 6);
  },

  getStarredQuestions: () => {
    return get().questions.filter((q) => q.isStarred && !q.isBlocked);
  },

  convertQuestionToFlashcard: (questionId) => {
    const state = get();
    const question = state.questions.find((q) => q.id === questionId);
    if (!question) return null;

    const aiAnswer = question.messages.find((m) => m.role === 'ai');
    const teacherAnswer = question.messages.find((m) => m.role === 'teacher');
    const answer = teacherAnswer || aiAnswer;

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      courseId: question.courseId,
      courseName: question.courseName,
      front: question.content,
      back: answer?.content || '暂无回答',
      knowledgePoints: question.knowledgePoints,
      masteryLevel: 'not_started',
      isStarred: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastReviewed: undefined,
      reviewCount: 0,
      sourceQuestionId: questionId,
    };

    set((s) => ({
      flashcards: [...s.flashcards, newCard],
    }));

    return newCard;
  },

  addMaterialToCourse: (courseId, material) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              materials: [...c.materials, material.name],
              materialList: [...c.materialList, material],
            }
          : c
      ),
    })),

  updateMaterialStatus: (materialId, status, courseId) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              materialList: c.materialList.map((m) =>
                m.id === materialId
                  ? {
                      ...m,
                      status,
                      processedAt: status === 'ready' ? new Date().toLocaleString('zh-CN') : m.processedAt,
                    }
                  : m
              ),
            }
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

  refreshReportWeakPoints: (courseId) => {
    const state = get();
    const courseCards = state.flashcards.filter((f) => f.courseId === courseId);
    const weakCards = courseCards.filter((f) => f.masteryLevel === 'weak');
    const learningCards = courseCards.filter((f) => f.masteryLevel === 'learning');
    const masteredCount = courseCards.filter((c) => c.masteryLevel === 'mastered').length;

    const dedupe = (arr: string[]) => Array.from(new Set(arr)).slice(0, 5);

    const weakTopics = dedupe(
      weakCards.flatMap((c) => c.knowledgePoints).filter(Boolean)
    );
    const learningTopics = dedupe(
      learningCards.flatMap((c) => c.knowledgePoints).filter(Boolean)
    );

    const noObviousWeakness = weakTopics.length === 0;

    set((s) => ({
      reportData: s.reportData.map((r) =>
        r.courseId === courseId
          ? {
              ...r,
              weakPoints: weakTopics,
              learningPoints: learningTopics,
              noObviousWeakness,
              avgMastery: Math.round(
                (masteredCount / Math.max(courseCards.length, 1)) * 100
              ),
            }
          : r
      ),
    }));
  },

  getStudentRecommendations: (studentId, courseId) => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return [];

    let cards = state.flashcards;
    if (courseId) {
      cards = cards.filter((f) => f.courseId === courseId);
    } else {
      cards = cards.filter((f) => student.courseIds.includes(f.courseId));
    }

    const recentQuestions = state.questions.filter(
      (q) => q.studentName === student.name
    );
    const recentQuestionKPs = new Set<string>();
    recentQuestions.forEach((q) => q.knowledgePoints.forEach((kp) => recentQuestionKPs.add(kp)));

    const studentSubmissions = state.submissions.filter(
      (s) => s.studentName === student.name && (s.score ?? 0) < 80
    );
    const submissionHomeworks = studentSubmissions.map((s) => s.homeworkId);
    const mistakeHomeworks = state.homeworks.filter((h) => submissionHomeworks.includes(h.id));
    const mistakeKPs = new Set<string>();
    mistakeHomeworks.forEach((h) => {
      const relatedCards = state.flashcards.filter((f) => f.courseId === h.courseId);
      relatedCards.forEach((c) => c.knowledgePoints.forEach((kp) => mistakeKPs.add(kp)));
    });

    const result: RecommendedFlashcard[] = cards.map((card) => {
      const reasons: RecommendReason[] = [];
      let priority = 0;

      if (card.masteryLevel === 'weak' || card.masteryLevel === 'not_started') {
        reasons.push('weak_point');
        priority += 10;
      }

      if (card.knowledgePoints.some((kp) => recentQuestionKPs.has(kp))) {
        reasons.push('recent_question');
        priority += 7;
      }

      if (card.knowledgePoints.some((kp) => mistakeKPs.has(kp))) {
        reasons.push('homework_mistake');
        priority += 8;
      }

      if (card.lastReviewed) {
        const lastDate = new Date(card.lastReviewed);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) {
          reasons.push('forgotten');
          priority += 5;
        }
      } else if (card.masteryLevel !== 'not_started') {
        reasons.push('forgotten');
        priority += 5;
      }

      return { flashcard: card, reasons, priority };
    });

    return result
      .filter((r) => r.reasons.length > 0)
      .sort((a, b) => b.priority - a.priority);
  },

  markStudentReviewComplete: (studentId, flashcardId, masteryLevel) => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    const card = state.flashcards.find((f) => f.id === flashcardId);
    if (!student || !card) return;

    const masteryLabels: Record<MasteryLevel, string> = {
      mastered: '记住了',
      learning: '模糊',
      weak: '没记住',
      not_started: '未学习',
    };

    const newRecord: GuidanceRecord = {
      id: `gr-${Date.now()}`,
      studentId,
      studentName: student.name,
      courseId: card.courseId,
      courseName: card.courseName,
      type: 'review',
      content: `复习完成：${card.knowledgePoints[0] || '知识点'}（掌握度：${masteryLabels[masteryLevel]}）`,
      relatedFlashcardIds: [flashcardId],
      createdAt: new Date().toLocaleString('zh-CN'),
      createdBy: state.settings.teacherName,
    };

    set((s) => ({
      guidanceRecords: [newRecord, ...s.guidanceRecords],
      flashcards: s.flashcards.map((f) =>
        f.id === flashcardId
          ? {
              ...f,
              masteryLevel,
              lastReviewed: new Date().toISOString().split('T')[0],
              reviewCount: f.reviewCount + 1,
            }
          : f
      ),
    }));

    get().refreshReportWeakPoints(card.courseId);
  },

  generateWeeklyPlan: (studentId) => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return null;

    const recommendations = state.getStudentRecommendations(studentId);
    if (recommendations.length === 0) return null;

    const studentCourses = state.courses.filter((c) => student.courseIds.includes(c.id));

    const courseMap = new Map(studentCourses.map((c) => [c.id, c.name]));

    const courseGroups = new Map<string, RecommendedFlashcard[]>();
    for (const rec of recommendations) {
      const cid = rec.flashcard.courseId;
      if (!courseGroups.has(cid)) {
        courseGroups.set(cid, []);
      }
      courseGroups.get(cid)!.push(rec);
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

    const courseIds = Array.from(courseGroups.keys());
    const items: ReviewPlanItem[] = [];

    for (const cid of courseIds) {
      const recs = courseGroups.get(cid)!;
      const courseIdx = courseIds.indexOf(cid);
      const daysOffset = 3 + courseIdx;
      const deadline = new Date(now);
      deadline.setDate(now.getDate() + daysOffset);

      for (const rec of recs) {
        const idx = items.length;
        items.push({
          id: `plan-item-${Date.now()}-${idx}`,
          flashcardId: rec.flashcard.id,
          courseId: cid,
          courseName: courseMap.get(cid) || rec.flashcard.courseName,
          knowledgePoint: rec.flashcard.knowledgePoints[0] || '知识点',
          priority: rec.priority,
          deadline: formatDateStr(deadline),
          completed: false,
        });
      }
    }

    const plan: ReviewPlan = {
      id: `plan-${Date.now()}`,
      studentId,
      studentName: student.name,
      items,
      createdAt: new Date().toLocaleString('zh-CN'),
      weekStart: formatDateStr(monday),
      weekEnd: formatDateStr(sunday),
      completedCount: 0,
      totalCount: items.length,
    };

    set((s) => ({
      reviewPlans: [...s.reviewPlans, plan],
    }));

    return plan;
  },

  completePlanItem: (planId, itemId, masteryLevel) => {
    set((state) => {
      const plan = state.reviewPlans.find((p) => p.id === planId);
      if (!plan) return {};

      const item = plan.items.find((i) => i.id === itemId);
      if (!item || item.completed) return {};

      const now = new Date().toLocaleString('zh-CN');
      const newCompletedCount = plan.completedCount + 1;

      return {
        reviewPlans: state.reviewPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                items: p.items.map((i) =>
                  i.id === itemId
                    ? { ...i, completed: true, completedAt: now, masteryLevel }
                    : i
                ),
                completedCount: newCompletedCount,
              }
            : p
        ),
      };
    });

    const plan = get().reviewPlans.find((p) => p.id === planId);
    const item = plan?.items.find((i) => i.id === itemId);
    if (plan && item) {
      get().markStudentReviewComplete(plan.studentId, item.flashcardId, masteryLevel);
    }
  },

  refreshAllReportWeakPoints: () => {
    const state = get();
    const courseIds = state.reportData.map((r) => r.courseId);
    for (const courseId of courseIds) {
      get().refreshReportWeakPoints(courseId);
    }
  },
}));
