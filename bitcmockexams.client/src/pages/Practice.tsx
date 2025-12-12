import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getExamTopics } from '../data/examTopics';
import Button from '@shared/components/ui/Button';
import Skeleton from '@shared/components/ui/Skeleton';
import { FaClock, FaTimes, FaPause, FaPlay, FaThumbsUp, FaFlag, FaEdit, FaTrash, FaReply, FaPlus, FaMinus, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaLock } from 'react-icons/fa';
import { useTestSuitesApi } from '@shared/api/testSuites';
import { useTestsApi } from '@shared/api/tests';
import { useAuth } from '@features/auth/context/AuthContext';
import { useAuthApi } from '@shared/api/auth';
import { useWalletApi } from '@shared/api/wallet';
import { getUserIdFromClaims } from '@shared/utils/auth';

// Enums matching Angular models
enum TestMode {
  Practice = 0,
  Quiz = 1
}

enum QuestionStatus {
  None = 0,
  IsAnswered = 1,
  IsMarkedForReview = 2,
  MarkedandAnswered = 3
}

enum TestStatus {
  None = 0,
  InProgress = 1,
  Completed = 2
}

interface OptionVM {
  id?: string | null;
  PKOptionId?: string;
  text: string;
  html?: string;
  Description?: string;
  isCorrect?: boolean;
  IsCorrect?: boolean;
  imageUrl?: string | null;
  ImageUrl?: string;
  isSelected?: boolean;
  isSelectedOption?: boolean;
}

interface Question {
  id: number;
  text: string;
  html?: string;
  Description?: string;
  options: OptionVM[];
  multi?: boolean;
  domain?: string;
  ModuleName?: string;
  explanationHtml?: string;
  Explanation?: string;
  imageUrl?: string | null;
  ImageUrl?: string;
  serverQuestionId?: string;
  PKTestQuestionId?: string;
  QuestionStatus?: QuestionStatus;
  SelectedOptionId?: string;
  SelectedOptions?: OptionVM[];
  isMarkedforReview?: boolean;
  Flag?: boolean;
  CourseURL?: string;
  ThumbNailes?: string;
}

interface CommentDTO {
  PKCommentId?: string;
  Comment: string;
  FKInterviewQuestionId: string;
  FKCommentedBy: string;
  FkCommentedUser: string;
  IsExam: boolean;
  ParentCommentId?: string;
  CommentedDate?: string;
  Votes?: number;
  Replies?: CommentDTO[];
  RepliesCount?: number;
  ReportCount?: number;
  isExpanded?: boolean;
  IsEdit?: boolean;
  TotalComments?: number;
  Pages?: number;
}

interface TestViewModel {
  PKBuyerTestId?: string;
  BuyerTestId?: string;
  FKTestId?: string;
  TestId?: string;
  Title?: string;
  SubTitle?: string;
  Mode: TestMode;
  Status: TestStatus;
  DurationinMinutes?: number;
  DurationinSeconds?: number;
  DefaultTimeinSecondsForEachQuestion?: number;
  DefaultTimeinMinutesForEachQuestion?: number;
  TimeElapsedinSeconds: number;
  QuestionTimeElapsedinSeconds: number;
  CurrentQuestionIndex: number;
  Questions: Question[];
  PreviousQuestion?: Question;
  PassPercentage?: number;
  TotalMarksAllocated?: number;
  MaximumMarks?: number;
  PriceInDollars?: number;
  IsPaused?: boolean;
  IsScoreCalculated?: boolean;
  CanPauseAndResume?: boolean;
  TestType?: number;
  IsCompleted?: boolean;
}

// Map API Test View Model to UI-friendly questions
const mapVmToQuestions = (vm: any): Question[] => {
  const list = Array.isArray(vm?.Questions) ? vm.Questions : [];
  return list.map((q: any, idx: number) => {
    const text = q?.QuestionText || q?.Text || q?.Question || `Question ${idx + 1}`;
    const html = typeof q?.Description === 'string' ? q.Description : undefined;
    const optsRaw = q?.Options || q?.Choices || q?.Answers || q?.OptionsDTO || q?.options || [];
    const options: OptionVM[] = Array.isArray(optsRaw)
      ? optsRaw.map((o: any) => ({
          id: o?.OptionId || o?.PKOptionId || o?.PKTestQuestionOptionId || o?.Id || null,
          PKOptionId: o?.PKOptionId || o?.Id || null,
          text: o?.OptionText || o?.Text || o?.AnswerText || (typeof o?.Description === 'string' ? '' : String(o)),
          html: typeof o?.Description === 'string' ? o?.Description : undefined,
          Description: o?.Description,
          isCorrect: typeof o?.IsCorrect === 'boolean' ? o?.IsCorrect : undefined,
          IsCorrect: o?.IsCorrect,
          imageUrl: o?.ImageUrl || null,
          ImageUrl: o?.ImageUrl,
          isSelected: Boolean(o?.isSelectedOption),
          isSelectedOption: o?.isSelectedOption,
        }))
      : [];
    const multi = Boolean(q?.IsMultiple || q?.AllowMultiple || (q?.MaximumChoices && q?.MaximumChoices > 1));
    const domain = q?.Domain || q?.DomainName || q?.Topic || q?.ModuleName || undefined;
    const serverQuestionId: string | undefined = q?.PKTestQuestionId || q?.QuestionId || q?.Id || undefined;
    const explanationHtml = typeof q?.Explanation === 'string' ? q?.Explanation : undefined;
    const imageUrl = q?.ImageUrl || null;
    
    return {
      id: idx + 1,
      text,
      html,
      Description: q?.Description,
      options,
      multi,
      domain,
      ModuleName: q?.ModuleName,
      explanationHtml,
      Explanation: q?.Explanation,
      imageUrl,
      ImageUrl: q?.ImageUrl,
      serverQuestionId,
      PKTestQuestionId: q?.PKTestQuestionId,
      QuestionStatus: q?.QuestionStatus ?? QuestionStatus.None,
      SelectedOptionId: q?.SelectedOptionId,
      SelectedOptions: q?.SelectedOptions,
      isMarkedforReview: q?.isMarkedforReview || (q?.QuestionStatus ?? 0) > 1,
      Flag: q?.Flag ?? true,
      CourseURL: q?.CourseURL,
      ThumbNailes: q?.ThumbNailes,
    } as Question;
  });
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
};

// Sanitize HTML (simple implementation - in production use DOMPurify)
const sanitizeHtml = (html: string): string => {
  return html; // For now, trust the HTML from server. Add DOMPurify in production.
};

const Practice: React.FC = () => {
  const navigate = useNavigate();
  const { code, sectionId } = useParams();
  const [searchParams] = useSearchParams();
  const qpTestId = searchParams.get('testId') || null;
  const mode = searchParams.get('mode') || '0'; // 0 = Practice, 1 = Quiz
  const topics = getExamTopics(code || '');
  const topic = topics.find(t => String(t.id) === String(sectionId)) || topics[0];
  const { user } = useAuth();
  const userId = useMemo(() => getUserIdFromClaims(user as any), [user]);
  const userName = useMemo(() => (user as any)?.name || (user as any)?.username || 'User', [user]);
  const userEmail = useMemo(() => (user as any)?.email || '', [user]);
  const userRole = useMemo(() => (user as any)?.role || 'Student', [user]);
  
  const { getTestSuiteByPathId, globalSearch } = useTestSuitesApi();
  const { getTestViewModel, isTestSubscribed, getCurrentExamQuestion } = useTestsApi() as any;
  const { getUserCreditDetails } = useAuthApi();
  const { getWalletBalance } = useWalletApi();

  // Basic state
  const [remoteDuration, setRemoteDuration] = useState<number | null>(null);
  const [remoteCount, setRemoteCount] = useState<number | null>(null);
  const [testId, setTestId] = useState<string | null>(qpTestId);
  const [pathIdResolved, setPathIdResolved] = useState<string | null>(null);
  const [hasCredit, setHasCredit] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isBDTUserSubscriber, setIsBDTUserSubscriber] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [suiteTitle, setSuiteTitle] = useState<string | null>(null);
  const [suiteSubTitle, setSuiteSubTitle] = useState<string | null>(null);
  const [testTitle, setTestTitle] = useState<string | null>(null);
  const [testSubTitle, setTestSubTitle] = useState<string | null>(null);
  const [serverVm, setServerVm] = useState<TestViewModel | null>(null);
  const [testSuiteDetails, setTestSuiteDetails] = useState<any>(null);
  
  // Exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExamOver, setIsExamOver] = useState(false);
  const [showAnswerClicked, setShowAnswerClicked] = useState(false);
  const [examLoaded, setExamLoaded] = useState(false);
  const [testMode, setTestMode] = useState<TestMode>(parseInt(mode) as TestMode);
  
  // Timer state
  const [minutesCounter, setMinutesCounter] = useState(0);
  const [secondsCounter, setSecondsCounter] = useState(0);
  const [totalMinutesCounter, setTotalMinutesCounter] = useState(0);
  const [totalSecondsCounter, setTotalSecondsCounter] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Question state
  const [selected, setSelected] = useState<Record<number, Set<number>>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [needCredits, setNeedCredits] = useState(0);
  
  // Comments state
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentPageIndex, setCommentPageIndex] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [testHelpfulness, setTestHelpfulness] = useState('');
  const [testReview, setTestReview] = useState('');
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [buyingAmount, setBuyingAmount] = useState(0);
  
  // Initial loading state
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Refs for cleanup
  const mountedRef = useRef(true);

  // Build PUT payload model expected by backend from current VM and overrides
  const buildPutModel = (
    vm: any,
    overrides: Partial<Record<string, unknown>> & { CurrentQuestionIndex: number; Questions: any[] }
  ) => {
    const durationMins = (vm?.DurationinMinutes ?? remoteDuration ?? 0) as number;
    const defaultQSec = (vm?.DefaultTimeinMinutesForEachQuestion ?? 0) as number;
    return {
      CanPauseAndResume: vm?.CanPauseAndResume ?? false,
      CurrentQuestionIndex: overrides.CurrentQuestionIndex,
      DefaultTimeinSecondsForEachQuestion: Math.max(0, Math.floor(defaultQSec * 60)),
      DurationinSeconds: Math.max(0, Math.floor(durationMins * 60)),
      FKTestId: vm?.FKTestId ?? testId ?? null,
      IsPaused: vm?.IsPaused ?? false,
      IsScoreCalculated: vm?.IsScoreCalculated ?? false,
      Mode: vm?.Mode ?? 0,
      PKBuyerTestId: vm?.PKBuyerTestId ?? vm?.BuyerTestId ?? null,
      PassPercentage: vm?.PassPercentage ?? 0,
      PreviousQuestion: vm?.PreviousQuestion ?? {},
      PriceInDollars: vm?.PriceInDollars ?? 0,
      QuestionTimeElapsedinSeconds: vm?.QuestionTimeElapsedinSeconds ?? 0,
      Questions: overrides.Questions,
      Status: vm?.Status ?? 0,
      SubTitle: vm?.SubTitle ?? testSubTitle ?? '',
      TestType: vm?.TestType ?? 0,
      TimeElapsedinSeconds: vm?.TimeElapsedinSeconds ?? 0,
      Title: vm?.Title ?? testTitle ?? '',
      TotalMarksAllocated: vm?.TotalMarksAllocated ?? vm?.MaximumMarks ?? 0,
      // Also provide identifiers the backend uses frequently
      TestId: testId,
      UserId: userId,
    } as Record<string, unknown>;
  };

  // Fetch suite details and select a test matching sectionId (PathId)
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (!code || !userId) return;
      const suites = await globalSearch(code, 0, 5);
      const suiteHit = suites?.[0];
      const pathId = suiteHit?.PathId || `${code}:${(topic?.title || '').replace(/[^A-Za-z0-9]+/g, '')}`;
      if (!mounted) return;
      setPathIdResolved(pathId);
      const suiteDetails = pathId ? await getTestSuiteByPathId(pathId, userId) : null;
      if (!mounted) return;
      if (suiteDetails) {
        setSuiteTitle(suiteDetails.TestSuiteTitle || null);
        setSuiteSubTitle(suiteDetails.TestSuiteSubTitle || null);
      }
      const test = (qpTestId && suiteDetails?.TestsDetailsDTO?.find(t => t.PKTestId === qpTestId))
        || suiteDetails?.TestsDetailsDTO?.find(t => t.PathId === sectionId)
        || suiteDetails?.TestsDetailsDTO?.[0];
      if (test && mounted) {
        setTestId(prev => prev ?? test.PKTestId);
        setRemoteDuration(test.DurationinMinutes || null);
        setRemoteCount(test.NumberOfQuestions || null);
        setTestTitle(test.Title || null);
        setTestSubTitle(test.SubTitle || null);
      }
    };
    fetch();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, sectionId, userId]);

  // Check credit availability for this PathId and user email
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const email = (user as any)?.email as string | undefined;
      if (!email || !pathIdResolved) return;
      const ok = await getUserCreditDetails(email, pathIdResolved);
      if (mounted) setHasCredit(ok);
      // Also fetch wallet balance for display or logic
      if (userId) {
        const bal = await getWalletBalance();
        if (mounted) setWalletBalance(bal);
      }
    };
    check();
    return () => { mounted = false; };
  }, [pathIdResolved, user]);

  // Fetch the test view model and bind to UI
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!testId || !userId) return;
      const subscribed = await isTestSubscribed(testId, userId);
      if (mounted) setIsSubscribed(subscribed);
      const vm = await getTestViewModel(testId, userId, 0);
      if (!mounted) return;
      setServerVm(vm);
      const qLen = Array.isArray(vm?.Questions) ? vm.Questions.length : null;
      if (qLen && qLen > 0) setRemoteCount(qLen);

      // If options are not present or empty, request current question details via PUT flow
      const hasOptions = Array.isArray(vm?.Questions) && vm.Questions.some((q: any) => Array.isArray(q?.Options || q?.options) && (q.Options?.length || q.options?.length));
      if (!hasOptions && Array.isArray(vm?.Questions) && vm.Questions.length > 0) {
        const reqQuestions = vm.Questions.map((q: any) => ({
          QuestionId: q?.PKTestQuestionId || q?.QuestionId || q?.Id,
          SelectedOptionId: null,
          QuestionStatus: 0,
          MarksScoredForthisQuestion: 0,
        }));
        const body = buildPutModel(vm, { CurrentQuestionIndex: 0, Questions: reqQuestions });
        let updated: any = null;
        try {
          updated = await getCurrentExamQuestion(false, false, body);
        } catch (e) {
          console.error('GetCurrentExamQuestion failed, skipping options enrichment', e);
        }
        if (mounted && updated) {
          // Merge options back into vm shape for mapping
          const merged = {
            ...vm,
            Questions: Array.isArray(vm?.Questions) ? vm.Questions.map((q: any) => {
              const qid = q?.PKTestQuestionId || q?.QuestionId || q?.Id;
              const upd = Array.isArray(updated?.Questions) ? updated.Questions.find((uq: any) => (uq?.PKTestQuestionId || uq?.QuestionId || uq?.Id) === qid) : null;
              if (upd && (upd.options || upd.Options)) {
                return { ...q, Options: upd.options || upd.Options };
              }
              return q;
            }) : vm?.Questions,
          };
          setServerVm(merged);
        }
      }
    };
    run();
    return () => { mounted = false; };
  }, [testId, userId]);

  // Build mock questions to fit UI
  const questions: Question[] = useMemo(() => {
    const mapped = serverVm ? mapVmToQuestions(serverVm) : [];
    if (mapped.length > 0) return mapped;
    const count = remoteCount ?? topic?.questions ?? 20;
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      text: `You are developing an Azure solution. Question ${i + 1}: Which two tools should you use?`,
      options: [
        'Microsoft Graph API',
        'Microsoft Authentication Library (MSAL)',
        'Azure API Management',
        'Microsoft Azure Security Center',
        'Microsoft Azure Key Vault SDK'
      ].map((t) => ({ text: t })),
      multi: true,
      domain: topic?.title || 'Exam Domain'
    }));
  }, [serverVm, topic, remoteCount]);

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Timer
  const [remaining, setRemaining] = useState(((remoteDuration ?? topic?.durationMins) || 60) * 60);
  useEffect(() => {
    setRemaining(((remoteDuration ?? topic?.durationMins) || 60) * 60);
  }, [topic, remoteDuration]);
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const q = questions[index];
  const total = questions.length;

  // Resume: initialize selected state from server VM once questions are mapped
  useEffect(() => {
    if (!serverVm || !Array.isArray(serverVm?.Questions)) return;
    const map: Record<number, Set<number>> = {};
    questions.forEach((qq) => {
      const svq = serverVm.Questions.find((x: any) => (x?.PKTestQuestionId || x?.QuestionId || x?.Id) === qq.serverQuestionId);
      if (!svq) return;
      const opts = svq.options || [];
      const set = new Set<number>();
      opts.forEach((o: any, idx: number) => {
        const isSel = Boolean(o?.isSelectedOption) || false;
        // Fallback: match SelectedOptionId when options flags not present
        if (!isSel && svq?.SelectedOptionId && (qq.options || [])[idx]?.id === svq.SelectedOptionId) {
          set.add(idx);
        } else if (isSel) {
          set.add(idx);
        }
      });
      if (set.size > 0) map[qq.id] = set;
    });
    if (Object.keys(map).length > 0) setSelected(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverVm, questions.length]);

  const toggleOption = (qi: number, oi: number) => {
    // Compute next selection first
    let nextSelectedIdxs: number[] = [];
    setSelected(prev => {
      const ns = { ...prev } as Record<number, Set<number>>;
      const current = new Set(ns[qi] || []);
      const isMulti = (questions.find(qq => qq.id === qi)?.multi) ?? true;
      if (isMulti) {
        if (current.has(oi)) current.delete(oi); else current.add(oi);
        ns[qi] = current;
      } else {
        // Radio: always select oi; never deselect all
        ns[qi] = new Set([oi]);
      }
      nextSelectedIdxs = [...(ns[qi] || new Set<number>())];
      return ns;
    });

    // Persist selection immediately using server IDs with the computed next selection
    const qq = questions.find(qq => qq.id === qi);
    if (qq && qq.serverQuestionId) {
      const optionsPayload = (qq.options || []).map((o, idx) => ({
        PKOptionId: o.id,
        isSelectedOption: nextSelectedIdxs.includes(idx),
      }));
      const body = buildPutModel(serverVm, {
        CurrentQuestionIndex: qi - 1,
        Questions: [
          {
            QuestionId: qq.serverQuestionId,
            SelectedOptionId: null,
            QuestionStatus: 1,
            MarksScoredForthisQuestion: 0,
            options: optionsPayload,
          },
        ],
      });
      // Fire and forget; ignore errors
      try {
        getCurrentExamQuestion(false, true, body);
      } catch {}
    }
  };

  const goto = (i: number) => {
    setIndex(Math.max(0, Math.min(total - 1, i)));
    setShowAnswer(false);
  };

  // Open 20% of questions if not subscribed; otherwise all
  const accessibleCount = useMemo(() => {
    // Requirement: show all questions and options regardless of subscription/credit
    return total;
  }, [total]);

  // Page-level loading state to present skeletons on mount/section change
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [sectionId]);

  return (
    <div className="w-full p-3">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        {loading ? (
          <>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-blue">
              {testTitle || topic?.title} <span className="text-text-primary">(Practice)</span>
            </h1>
            {suiteSubTitle && (
              <div className="text-text-secondary mt-1">{suiteSubTitle}</div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Wallet: ₹{walletBalance}</span>
              <Button variant="secondary" className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-6 py-2">Unlock Questions</Button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question panel */}
        <div className="lg:col-span-9">
          <div className="rounded-2xl bg-white shadow-md border border-border p-6">
            {loading ? (
              <>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-8 w-32 rounded-full" />
                </div>
                <div className="mt-6">
                  <Skeleton className="h-8 w-44 rounded-md" />
                </div>
                <Skeleton className="h-20 w-full mt-6" />
                <Skeleton className="h-10 w-2/5 mt-6 rounded-lg" />
                <div className="mt-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-[auto_auto_1fr_auto_auto] gap-3 items-center">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-24" />
                  <span />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-10 w-28 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-text-primary">Question: <span className="text-primary-blue">{String(index + 1).padStart(2,'0')} of {total}</span></div>
                  <div className="flex items-center gap-2 bg-yellow-200 text-text-primary rounded-full px-4 py-2">
                    <FaClock />
                    <span className="font-semibold">Time: {formatTime(remaining)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <span className="inline-block bg-light-blue text-primary-blue rounded-md px-4 py-2 font-semibold">Domain: {testSubTitle || q.domain || topic?.title}</span>
                </div>

                {/* Question text and HTML body */}
                {q.html ? (
                  <div className="mt-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: q.html }} />
                ) : (
                  <p className="mt-6 text-lg leading-relaxed text-text-primary">{q.text}</p>
                )}

                <div className="mt-6 rounded-lg bg-green-100 text-green-700 px-4 py-3">
                  {q.multi ? 'Please select all correct answers' : 'Please select the correct answer'}
                </div>
                {!hasCredit && (
                  <div className="mt-3 rounded-lg bg-yellow-100 text-yellow-800 px-4 py-3">
                    You don't have credits to unlock full content for this suite.
                  </div>
                )}
                {!isSubscribed && (
                  <div className="mt-3 rounded-lg bg-blue-100 text-blue-800 px-4 py-3">
                    This test is not subscribed for your account. Subscribe to access full content.
                  </div>
                )}

                {/* Options */}
                <div className="mt-4 space-y-4">
                  {q.options.map((opt, i) => {
                    const selectedSet = selected[q.id] || new Set<number>();
                    const isSelected = selectedSet.has(i);
                    const label = String.fromCharCode(65 + i);
                    const isCorrect = showAnswer && Boolean(opt.isCorrect);
                    const isWrong = showAnswer && isSelected && !opt.isCorrect;
                    const base = 'rounded-xl border px-4 py-4 transition-colors';
                    const state = isCorrect
                      ? 'border-green-600 bg-green-50'
                      : isWrong
                        ? 'border-red-600 bg-red-50'
                        : isSelected
                          ? 'ring-2 ring-primary-blue bg-light-blue border-primary-blue'
                          : 'bg-white border-border hover:border-primary-blue';
                    return (
                      <label key={i} className={`w-full block cursor-pointer ${base} ${state}`}>
                        <div className="flex items-start gap-4">
                          <input
                            type={q.multi ? 'checkbox' : 'radio'}
                            name={`q_${q.id}`}
                            checked={isSelected}
                            onChange={() => toggleOption(q.id, i)}
                            className="mt-1"
                          />
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-border text-text-secondary font-semibold">
                            {label}
                          </span>
                          <div className="text-text-primary flex-1">
                            {opt.html ? (
                              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: opt.html }} />
                            ) : (
                              <span>{opt.text}</span>
                            )}
                            {opt.imageUrl && (
                              <img src={opt.imageUrl} alt={`option ${label}`} className="mt-3 max-w-full h-auto rounded" />
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Show Answer */}
                <div className="mt-6 rounded-xl border border-border bg-gray-50 p-4">
                  <button className="text-primary-blue font-semibold" onClick={() => setShowAnswer(s => !s)}>
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                  </button>
                  {showAnswer && (
                    <>
                      <div className="mt-3 text-text-primary">
                        <strong>Correct Answer{q.multi ? 's' : ''}: </strong>
                        {q.options
                          .map((o, idx) => ({ o, idx }))
                          .filter(({ o }) => o.isCorrect)
                          .map(({ idx }, j, arr) => `${String.fromCharCode(65 + idx)}${j === arr.length - 1 ? '' : ', '}`)
                          .join('') || 'Not available'}
                      </div>
                      {q.explanationHtml && (
                        <div className="mt-3 prose max-w-none" dangerouslySetInnerHTML={{ __html: q.explanationHtml }} />
                      )}
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex flex-wrap gap-3 items-center">
                  <Button variant="secondary" size="small" onClick={() => goto(0)}>{'« First'}</Button>
                  <Button variant="secondary" size="small" onClick={() => goto(index - 1)}>{'‹ Previous'}</Button>
                  <Button variant="primary" size="small" onClick={() => goto(index + 1)}>{'Next ›'}</Button>
                  <Button variant="primary" size="small" onClick={() => goto(total - 1)}>{'Last »'}</Button>
                  <div className="ml-auto">
                    <Button
                      variant="secondary"
                      size="medium"
                      className="!bg-green-600 !text-white hover:!bg-green-700 !border-0 rounded-full px-6"
                    >
                      Finish
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-white shadow-md border border-border p-6">
            {loading ? (
              <>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="m-0 font-bold text-text-primary">Questions</h3>
                  <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <input
                      type="checkbox"
                      checked={!!marked[q.id]}
                      onChange={(e) => setMarked(m => ({ ...m, [q.id]: e.target.checked }))}
                    />
                    Mark for Review
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-3">
                  {Array.from({ length: accessibleCount }, (_, i) => (
                    <button
                      key={i}
                      className={`h-12 rounded-md border ${i === index ? 'bg-primary-blue text-white border-primary-blue' : 'bg-gray-100 text-text-primary border-border'} font-semibold`}
                      onClick={() => goto(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  {/* All questions visible; no locks */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
