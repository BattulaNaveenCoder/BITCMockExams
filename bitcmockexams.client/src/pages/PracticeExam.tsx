import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import Button from '@shared/components/ui/Button';
import Skeleton from '@shared/components/ui/Skeleton';
import { FaClock, FaTimes, FaPause, FaPlay, FaThumbsUp, FaFlag, FaEdit, FaTrash, FaReply, FaPlus, FaMinus, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaLock, FaCheck } from 'react-icons/fa';
import { useTestSuitesApi } from '@shared/api/testSuites';
import { useTestsApi } from '@shared/api/tests';
import { useAuth } from '@features/auth/context/AuthContext';
import { useAuthApi } from '@shared/api/auth';
import { useWalletApi } from '@shared/api/wallet';
import { getUserIdFromClaims, normalizeClaims } from '@shared/utils/auth';

// CSS for HTML content rendering
const htmlContentStyles = `
  .html-content {
    line-height: 1.6;
  }
  .html-content p {
    margin-bottom: 1rem;
  }
  .html-content ul, .html-content ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  .html-content li {
    margin-bottom: 0.5rem;
  }
  .html-content strong, .html-content b {
    font-weight: 600;
  }
  .html-content u {
    text-decoration: underline;
  }
  .html-content div {
    margin-bottom: 0.5rem;
  }
  .html-content br {
    display: block;
    margin-bottom: 0.5rem;
  }
  .html-content span {
    display: inline;
  }
  .html-content code {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
  }
  .html-content pre {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  .html-content table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;
  }
  .html-content th, .html-content td {
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
    text-align: left;
  }
  .html-content th {
    background-color: #f9fafb;
    font-weight: 600;
  }
  .html-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1rem 0;
    display: block;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }
  .html-content img[style*="float:left"], .html-content img[align="left"] {
    float: left;
    margin-right: 1rem;
    margin-bottom: 1rem;
  }
  .html-content img[style*="float:right"], .html-content img[align="right"] {
    float: right;
    margin-left: 1rem;
    margin-bottom: 1rem;
  }
  .html-content figure {
    margin: 1rem 0;
  }
  .html-content figcaption {
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
    margin-top: 0.5rem;
  }
  .html-content a {
    color: #3b82f6;
    text-decoration: underline;
  }
  .html-content a:hover {
    color: #2563eb;
  }
`;

// ===== ENUMS & INTERFACES =====
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
  PKOptionId?: string;
  Description?: string;
  IsCorrect?: boolean;
  ImageUrl?: string;
  isSelectedOption?: boolean;
}

interface Question {
  PKTestQuestionId?: string;
  Description?: string;
  ImageUrl?: string;
  options: OptionVM[];
  ModuleName?: string;
  Explanation?: string;
  QuestionStatus?: QuestionStatus;
  SelectedOptionId?: string;
  isMarkedforReview?: boolean;
  Flag?: boolean;
  CourseURL?: string;
  ThumbNailes?: string;
}

interface TestViewModel {
  PKBuyerTestId?: string;
  FKTestId?: string;
  Title?: string;
  SubTitle?: string;
  Mode: TestMode;
  Status: TestStatus;
  DurationinSeconds?: number;
  DefaultTimeinSecondsForEachQuestion?: number;
  TimeElapsedinSeconds: number;
  QuestionTimeElapsedinSeconds: number;
  CurrentQuestionIndex: number;
  Questions: Question[];
  PreviousQuestion?: Question;
  PassPercentage?: number;
  TotalMarksAllocated?: number;
  IsPaused?: boolean;
  TestType?: number;
  PriceInDollars?: number;
  CanPauseAndResume?: boolean;
  IsScoreCalculated?: boolean;
}

interface CommentDTO {
  PKCommentId?: string;
  Comment: string;
  FKInterviewQuestionId: string;
  FKCommentedBy: string;
  FkCommentedUser: string;
  CommentedDate?: string;
  Votes?: number;
  Replies?: CommentDTO[];
  RepliesCount?: number;
  ReportCount?: number;
  isExpanded?: boolean;
  IsEdit?: boolean;
  TotalComments?: number;
  ParentCommentId?: string;
  Pages?: number;
}

interface UserCommentVote {
  PkvoterId?: string;
  FkCommentId?: string;
  FkQuestionId?: string;
  FkuserId?: string;
  Vote?: number;
}

interface UsersCommentReport {
  pkReportId?: string;
  fkCommentId?: string;
  fkQuestionId?: string;
  fkuserId?: string;
  reportCount?: number;
}

// ===== UTILITY FUNCTIONS =====
const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Shuffle array utility (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const buildApiPayload = (viewModel: TestViewModel | null, currentIdx: number, previousQuestion?: Question) => {
  if (!viewModel) return null;
  
  return {
    PKBuyerTestId: viewModel.PKBuyerTestId || '',
    FKTestId: viewModel.FKTestId || '',
    Title: viewModel.Title || '',
    SubTitle: viewModel.SubTitle || '',
    Mode: viewModel.Mode,
    Status: viewModel.Status,
    DurationinSeconds: viewModel.DurationinSeconds || 0,
    DefaultTimeinSecondsForEachQuestion: viewModel.DefaultTimeinSecondsForEachQuestion || 0,
    TimeElapsedinSeconds: viewModel.TimeElapsedinSeconds,
    QuestionTimeElapsedinSeconds: viewModel.QuestionTimeElapsedinSeconds,
    CurrentQuestionIndex: currentIdx,
    PassPercentage: viewModel.PassPercentage || 0,
    TotalMarksAllocated: viewModel.TotalMarksAllocated || 0,
    IsPaused: viewModel.IsPaused || false,
    TestType: viewModel.TestType || 0,
    PriceInDollars: viewModel.PriceInDollars || 0,
    CanPauseAndResume: viewModel.CanPauseAndResume || false,
    IsScoreCalculated: viewModel.IsScoreCalculated || false,
    PreviousQuestion: previousQuestion || {},
    Questions: viewModel.Questions || []
  };
};

// ===== MAIN COMPONENT =====
const PracticeExam: React.FC = () => {
  
  const navigate = useNavigate();
  const { PathId, Title, TestId } = useParams();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') || '0';
  
  const { user } = useAuth();
  const userId = useMemo(() => getUserIdFromClaims(user as any), [user]);
  const userName = useMemo(() => (user as any)?.name || (user as any)?.username || 'User', [user]);
  const userEmail = useMemo(() => {
    const claims = user as any;
    if (!claims) return '';
    return claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] 
      || claims.email 
      || '';
  }, [user]);
  const userRole = useMemo(() => (user as any)?.role || 'Student', [user]);
  
  const { getTestSuiteByPathId, globalSearch } = useTestSuitesApi();
  const { getTestViewModel, isTestSubscribed, getCurrentExamQuestion, getVideosLinkForQuestion } = useTestsApi() as any;
  const { getUserCreditDetails, checkBDTSubscription } = useAuthApi();
  const { getWalletBalance } = useWalletApi();

  // ===== STATE MANAGEMENT =====bu
  // Basic state
  const [testId, setTestId] = useState<string | null>(TestId || null);
  const [pathIdResolved, setPathIdResolved] = useState<string | null>(PathId || null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isBDTUserSubscriber, setIsBDTUserSubscriber] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [testSuiteDetails, setTestSuiteDetails] = useState<any>(null);
  const [testTitle, setTestTitle] = useState<string>();
  const [testMode] = useState<TestMode>(parseInt(modeParam) as TestMode);
  
  // Exam state
  const [testViewModel, setTestViewModel] = useState<TestViewModel | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExamOver, setIsExamOver] = useState(false);
  const [showAnswerClicked, setShowAnswerClicked] = useState(false);
  const [examLoaded, setExamLoaded] = useState(false);
  const [needCredits, setNeedCredits] = useState(0);
  
  // Timer state
  const [minutesCounter, setMinutesCounter] = useState(0);
  const [secondsCounter, setSecondsCounter] = useState(0);
  const [totalMinutesCounter, setTotalMinutesCounter] = useState(0);
  const [totalSecondsCounter, setTotalSecondsCounter] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Comments state
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [totalCommentsCount, setTotalCommentsCount] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [replyComment, setReplyComment] = useState('');
  const [editCommentField, setEditCommentField] = useState('');
  const [isVisiblePostComment, setIsVisiblePostComment] = useState<number>(-1);
  const [isVisibleEditReply, setIsVisibleEditReply] = useState<number>(-1);
  const [oldComment, setOldComment] = useState('');
  const [deleteCommentData, setDeleteCommentData] = useState<CommentDTO | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportCommentId, setReportCommentId] = useState('');
  const [commentedUser, setCommentedUser] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [isCommentWhitespace, setIsCommentWhitespace] = useState(false);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [testHelpfulness, setTestHelpfulness] = useState('');
  const [testReview, setTestReview] = useState('');
  
  // Payment modal state
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [isBDTCheckLoading, setIsBDTCheckLoading] = useState(true);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const mountedRef = useRef(true);
  const [isOfflineOrOnlineStatus, setIsOfflineOrOnlineStatus] = useState(true);
  const [showAnswerVisible, setShowAnswerVisible] = useState(false);

  // ===== COMPUTED VALUES =====
  const questions = useMemo(() => testViewModel?.Questions || [], [testViewModel]);
  const currentQuestion = useMemo(() => {
    const q = testViewModel?.Questions?.[currentIndex];
    console.log('Current question:', q);
    return q;
  }, [testViewModel, currentIndex]);

  // Debug logging
  useEffect(() => {
    console.log('PracticeExam mounted with params:', { PathId, Title, TestId, modeParam });
    console.log('User info:', { userId, userName, userEmail, userRole });
    console.log('Test ID:', testId);
  }, []);

  useEffect(() => {
    console.log('Test ViewModel updated:', {
      hasViewModel: !!testViewModel,
      questionsCount: testViewModel?.Questions?.length,
      currentIndex,
      currentQuestionId: currentQuestion?.PKTestQuestionId
    });
  }, [testViewModel, currentIndex, currentQuestion]);
  const isCheckBox = useMemo(() => {
    if (!currentQuestion?.options) return false;
    const correctCount = currentQuestion.options.filter(o => o.IsCorrect).length;
    return correctCount > 1;
  }, [currentQuestion]);

  const quizWithQuestionTimer = useMemo(() => {
    return (testViewModel?.DefaultTimeinSecondsForEachQuestion || 0) !== 0 && testMode === TestMode.Quiz;
  }, [testViewModel, testMode]);

  // ===== TIMER FUNCTIONS =====
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = setInterval(() => {
      if (testMode === TestMode.Quiz) {
        setSecondsCounter(prev => {
          if (prev > 0) {
            if (testViewModel?.DefaultTimeinSecondsForEachQuestion) {
              // Per-question timer
              if (testViewModel) {
                testViewModel.QuestionTimeElapsedinSeconds++;
              }
            } else {
              // Total exam timer
              if (testViewModel) {
                testViewModel.TimeElapsedinSeconds++;
              }
            }
            return prev - 1;
          } else {
            if (minutesCounter > 0) {
              setMinutesCounter(m => m - 1);
              return 59;
            }
            return 0;
          }
        });
      } else {
        // Practice mode - count up
        setSecondsCounter(prev => {
          if (prev < 59) {
            if (testViewModel) {
              testViewModel.TimeElapsedinSeconds++;
            }
            return prev + 1;
          } else {
            setMinutesCounter(m => m + 1);
            return 0;
          }
        });
      }
    }, 1000);
  }, [testMode, minutesCounter, testViewModel]);

  const startTotalTimer = useCallback(() => {
    if (totalTimerIntervalRef.current) clearInterval(totalTimerIntervalRef.current);
    
    totalTimerIntervalRef.current = setInterval(() => {
      setTotalSecondsCounter(prev => {
        if (prev > 0) {
          if (testViewModel) {
            testViewModel.TimeElapsedinSeconds++;
          }
          return prev - 1;
        } else {
          if (totalMinutesCounter > 0) {
            setTotalMinutesCounter(m => m - 1);
            return 59;
          }
          return 0;
        }
      });
    }, 1000);
  }, [totalMinutesCounter, testViewModel]);

  const pauseTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const pauseTotalTimer = useCallback(() => {
    if (totalTimerIntervalRef.current) {
      clearInterval(totalTimerIntervalRef.current);
      totalTimerIntervalRef.current = null;
    }
  }, []);

  const resumeTimers = useCallback(() => {
    startTimer();
    if (quizWithQuestionTimer) {
      startTotalTimer();
    }
  }, [startTimer, startTotalTimer, quizWithQuestionTimer]);

  // ===== NAVIGATION FUNCTIONS =====
  const goToQuestion = useCallback(async (index: number) => {
    console.log('goToQuestion called with index:', index);
    if (index < 0 || index >= questions.length) {
      console.log('Invalid index, aborting');
      return;
    }
    if (isPaused) {
      console.log('Exam is paused, aborting');
      return;
    }
    if (!testViewModel) {
      console.log('No testViewModel, aborting');
      return;
    }
    
    setIsQuestionLoading(true);
    setCurrentIndex(index);
    setShowAnswerClicked(false);
    
    // Build proper payload for API
    const payload = buildApiPayload(testViewModel, index, testViewModel.Questions[currentIndex]);
    
    if (!payload) {
      console.error('Failed to build payload');
      setIsQuestionLoading(false);
      return;
    }
    
    // Fetch question details from API
    try {
      console.log('Fetching question details from API');
      const questionData = await getCurrentExamQuestion(isExamOver, false, payload, false);
      console.log('Question data received:', questionData);
      
      if (questionData) {
        // Update the specific question in the Questions array with the fetched data
        const updatedQuestions = [...testViewModel.Questions];
        const existingQuestion = updatedQuestions[index];
        
        // Determine the selected option IDs (prefer existing, then from API)
        const selectedOptionId = existingQuestion?.SelectedOptionId ?? questionData.SelectedOptionId ?? '';
        const selectedIds = selectedOptionId.split(',').filter(Boolean);
        
        // Get options from API response
        const apiOptions = questionData.options || questionData.Options || [];
        
        // Merge options while setting selection state based on SelectedOptionId
        const mergedOptions = apiOptions.map((newOption: any, optIdx: number) => {
          const existingOption = existingQuestion?.options?.[optIdx];
          // Check if this option's ID is in the selected IDs
          const isSelected = selectedIds.includes(String(newOption.PKOptionId || newOption.pkOptionId || ''));
          
          return {
            ...newOption,
            // Set selection based on SelectedOptionId, fallback to existing state
            isSelectedOption: isSelected || existingOption?.isSelectedOption || newOption.isSelectedOption || false
          };
        });
        
        updatedQuestions[index] = {
          ...(existingQuestion || {}),
          Description: questionData.Description || existingQuestion?.Description,
          ImageUrl: questionData.ImageUrl || existingQuestion?.ImageUrl,
          options: mergedOptions,
          ModuleName: questionData.ModuleName || existingQuestion?.ModuleName,
          Explanation: questionData.Explanation || existingQuestion?.Explanation,
          CourseURL: questionData.CourseURL || existingQuestion?.CourseURL,
          ThumbNailes: questionData.ThumbNailes || existingQuestion?.ThumbNailes,
          // Preserve question state
          QuestionStatus: existingQuestion?.QuestionStatus ?? questionData.QuestionStatus,
          isMarkedforReview: existingQuestion?.isMarkedforReview ?? questionData.isMarkedforReview,
          SelectedOptionId: selectedOptionId,
          PKTestQuestionId: existingQuestion?.PKTestQuestionId ?? questionData.PKTestQuestionId
        };
        
        setTestViewModel({
          ...testViewModel,
          Questions: updatedQuestions
        });
      }
    } catch (error) {
      console.error('Failed to fetch question data:', error);
    } finally {
      setIsQuestionLoading(false);
    }
  }, [questions.length, isPaused, testViewModel, currentIndex, getCurrentExamQuestion, isExamOver]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  }, [currentIndex, questions.length, goToQuestion]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);

  const handleFirst = useCallback(() => {
    goToQuestion(0);
  }, [goToQuestion]);

  const handleLast = useCallback(() => {
    goToQuestion(questions.length - 1);
  }, [questions.length, goToQuestion]);

  // ===== OPTION SELECTION =====
  const handleOptionChange = useCallback(async (optionIndex: number) => {
    if (!currentQuestion || !testViewModel) return;
    
    const newOptions = [...(currentQuestion.options || [])];
    
    if (isCheckBox) {
      // Checkbox - toggle selection
      newOptions[optionIndex] = {
        ...newOptions[optionIndex],
        isSelectedOption: !newOptions[optionIndex].isSelectedOption
      };
    } else {
      // Radio - select only this one
      newOptions.forEach((opt, idx) => {
        opt.isSelectedOption = idx === optionIndex;
      });
    }
    
    // Build SelectedOptionId string (comma-separated PKOptionIds)
    const selectedOptionIds = newOptions
      .filter((opt, idx) => opt.isSelectedOption)
      .map(opt => opt.PKOptionId)
      .filter(Boolean)
      .join(',');
    
    // Update question status
    const hasSelection = newOptions.some(o => o.isSelectedOption);
    const newStatus = currentQuestion.isMarkedforReview
      ? (hasSelection ? QuestionStatus.MarkedandAnswered : QuestionStatus.IsMarkedForReview)
      : (hasSelection ? QuestionStatus.IsAnswered : QuestionStatus.None);
    
    // Update the question in the view model
    const updatedQuestions = [...testViewModel.Questions];
    updatedQuestions[currentIndex] = {
      ...updatedQuestions[currentIndex],
      options: newOptions,
      QuestionStatus: newStatus,
      SelectedOptionId: selectedOptionIds || undefined
    };
    
    const updatedViewModel = {
      ...testViewModel,
      Questions: updatedQuestions,
      PreviousQuestion: testViewModel.Questions[currentIndex]
    };
    
    setTestViewModel(updatedViewModel);
    
    // Persist to backend with isUpdate=true
    try {
      const payload = buildApiPayload(updatedViewModel, currentIndex, updatedQuestions[currentIndex]);
      if (!payload) return;
      console.log('Persisting option selection');
      await getCurrentExamQuestion(false, true, payload, false);
    } catch (error) {
      console.error('Failed to persist option selection:', error);
    }
  }, [currentQuestion, isCheckBox, currentIndex, testViewModel, getCurrentExamQuestion]);

  // ===== MARK FOR REVIEW =====
  const handleMarkForReview = useCallback((checked: boolean) => {
    if (!testViewModel || !currentQuestion) return;
    
    const hasSelection = currentQuestion.options?.some(o => o.isSelectedOption);
    const newStatus = checked
      ? (hasSelection ? QuestionStatus.MarkedandAnswered : QuestionStatus.IsMarkedForReview)
      : (hasSelection ? QuestionStatus.IsAnswered : QuestionStatus.None);
    
    const updatedQuestions = [...testViewModel.Questions];
    updatedQuestions[currentIndex] = {
      ...updatedQuestions[currentIndex],
      isMarkedforReview: checked,
      QuestionStatus: newStatus
    };
    
    setTestViewModel({
      ...testViewModel,
      Questions: updatedQuestions
    });
  }, [testViewModel, currentQuestion, currentIndex]);

  // ===== UPDATE BUYER TEST =====
  const updateBuyerTest = useCallback(async (isFinish: boolean = false) => {
    if (!testViewModel) return;
    
    const updatedViewModel = isFinish ? {
      ...testViewModel,
      Status: TestStatus.Completed
    } : testViewModel;
    
    const payload = buildApiPayload(updatedViewModel, currentIndex, testViewModel.Questions[currentIndex]);
    
    if (!payload) return;
    
    try {
      const response = await getCurrentExamQuestion(isFinish,isFinish ? true : false, payload);
      if (isFinish && response) {
        setIsExamOver(true);
        setTestViewModel(response);
      }
    } catch (error) {
      console.error('Failed to update buyer test:', error);
    }
  }, [testViewModel, currentIndex, getCurrentExamQuestion]);

  // ===== FINISH EXAM =====
  const handleFinish = useCallback(async () => {
    pauseTimer();
    if (quizWithQuestionTimer) {
      pauseTotalTimer();
    }
    
    // Update buyer test as completed
    await updateBuyerTest(true);
    
    // Show review modal
    setShowReviewModal(true);
  }, [pauseTimer, pauseTotalTimer, quizWithQuestionTimer, updateBuyerTest]);

  const handleSubmitReview = useCallback(async () => {
    // Submit review to API (to be implemented with actual API)
    console.log('Review submitted:', { rating, testHelpfulness, testReview });
    
    setShowReviewModal(false);
    
    // Navigate to summary or exam list
    if (testViewModel?.PKBuyerTestId) {
      navigate(`/exams/summary/${testViewModel.PKBuyerTestId}`);
    } else {
      navigate(`/exams/${PathId}`);
    }
  }, [rating, testHelpfulness, testReview, testViewModel, navigate, PathId]);

  // ===== PAUSE/RESUME =====
  const handlePause = useCallback(() => {
    setIsPaused(true);
    pauseTimer();
    if (quizWithQuestionTimer) {
      pauseTotalTimer();
    }
  }, [pauseTimer, pauseTotalTimer, quizWithQuestionTimer]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    resumeTimers();
  }, [resumeTimers]);

  // ===== CLOSE EXAM =====
  const handleClose = useCallback(async () => {
    pauseTimer();
    if (quizWithQuestionTimer) {
      pauseTotalTimer();
    }
    
    // Save progress before closing
    await updateBuyerTest(false);
    
    // Navigate back to test suite details
    navigate(`/exams/${PathId}`);
  }, [pauseTimer, pauseTotalTimer, quizWithQuestionTimer, updateBuyerTest, navigate, PathId]);

  // ===== UNLOCK QUESTIONS =====
  const handleUnlock = useCallback(() => {
    setShowUnlockModal(true);
  }, []);

  const handleConfirmUnlock = useCallback(async () => {
    // Implement payment logic here
    console.log('Unlocking questions for:', testSuiteDetails?.TotalPriceInDollars);
    setShowUnlockModal(false);
  }, [testSuiteDetails]);

  // ===== COMMENTS FUNCTIONS =====
  const fetchComments = useCallback(async (questionId: string, pageIndex: number = 1) => {
    if (!questionId) return;
    
    try {
      // TODO: Replace with actual API call
      // const response = await interviewQuestionService.GetAllCommentsandVotesById(questionId, pageIndex, userRole);
      const response: CommentDTO[] = []; // Placeholder
      
      const processedComments = response.map(comment => ({
        ...comment,
        isExpanded: false,
        RepliesCount: comment.Replies?.length || 0
      }));
      
      setComments(processedComments);
      setTotalCommentsCount(processedComments[0]?.TotalComments || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [userRole]);

  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText || commentText.trim().length < 2) {
      alert('Comment must be more than one character');
      return;
    }
    
    if (!userId || !userName || !currentQuestion?.PKTestQuestionId) return;
    
    const newComment: CommentDTO = {
      Comment: commentText.trim(),
      FKInterviewQuestionId: currentQuestion.PKTestQuestionId,
      FKCommentedBy: userId,
      FkCommentedUser: userName
    };
    
    try {
      // TODO: Replace with actual API call
      // const result = await interviewQuestionService.AddComment(newComment);
      const result = 1; // Placeholder
      
      if (result === 1) {
        setCommentText('');
        setCurrentPageIndex(1);
        if (currentQuestion.PKTestQuestionId) {
          await fetchComments(currentQuestion.PKTestQuestionId, 1);
        }
        alert('Your comment has been successfully added');
      } else {
        alert('Your Comments on this question has reached its limit today, please try again tomorrow');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  }, [commentText, userId, userName, currentQuestion, fetchComments]);

  const handleEditComment = useCallback((comment: CommentDTO) => {
    setOldComment(comment.Comment);
    setComments(prev => prev.map(c => 
      c.PKCommentId === comment.PKCommentId ? { ...c, IsEdit: true } : c
    ));
  }, []);

  const handleUpdateComment = useCallback(async (comment: CommentDTO) => {
    if (comment.Comment === oldComment) {
      setComments(prev => prev.map(c => 
        c.PKCommentId === comment.PKCommentId ? { ...c, IsEdit: false } : c
      ));
      return;
    }
    
    if (comment.Comment.trim().length < 2) {
      alert('Your comment must be more than one character');
      return;
    }
    
    try {
      // TODO: Replace with actual API call
      // await interviewQuestionService.UpdateComment(comment);
      
      setComments(prev => prev.map(c => 
        c.PKCommentId === comment.PKCommentId ? { ...c, IsEdit: false } : c
      ));
      alert('Your comment has been successfully updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    }
  }, [oldComment]);

  const handleCancelEdit = useCallback((comment: CommentDTO) => {
    setComments(prev => prev.map(c => 
      c.PKCommentId === comment.PKCommentId ? { ...c, Comment: oldComment, IsEdit: false } : c
    ));
  }, [oldComment]);

  const handleDeleteComment = useCallback((comment: CommentDTO) => {
    setDeleteCommentData(comment);
    setShowDeleteModal(true);
  }, []);

  const confirmDeleteComment = useCallback(async () => {
    if (!deleteCommentData || !currentQuestion) return;
    
    try {
      // TODO: Replace with actual API call
      // await interviewQuestionService.DeleteComment(deleteCommentData.PKCommentId);
      
      alert('Your comment has successfully deleted');
      
      const newPageIndex = comments.length === 1 ? Math.max(currentPageIndex - 1, 1) : currentPageIndex;
      setCurrentPageIndex(newPageIndex);
      if (currentQuestion.PKTestQuestionId) {
        await fetchComments(currentQuestion.PKTestQuestionId, newPageIndex);
      }
      setShowDeleteModal(false);
      setDeleteCommentData(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  }, [deleteCommentData, currentQuestion, comments.length, currentPageIndex, fetchComments]);

  const handleVoteComment = useCallback(async (comment: CommentDTO) => {
    if (!userId) return;
    
    const userCommentVote: UserCommentVote = {
      FkCommentId: comment.PKCommentId,
      FkQuestionId: comment.FKInterviewQuestionId,
      FkuserId: userId,
      Vote: 1,
      PkvoterId: ''
    };
    
    try {
      // TODO: Replace with actual API call
      // const result = await interviewQuestionService.AddVotesforComment(userCommentVote);
      const result = true; // Placeholder
      
      if (result) {
        alert('Voted successfully');
        if (comment.FKInterviewQuestionId) {
          await fetchComments(comment.FKInterviewQuestionId, currentPageIndex);
        }
      } else {
        alert('Only one vote allowed');
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
      alert('Failed to vote');
    }
  }, [userId, currentPageIndex, fetchComments]);

  const handleReplyComment = useCallback(async (parentCommentId: string) => {
    if (!replyComment || replyComment.trim().length < 2) {
      alert('Comment must be more than one character');
      return;
    }
    
    if (!userId || !userName || !currentQuestion?.PKTestQuestionId) return;
    
    const newReply: CommentDTO = {
      Comment: replyComment.trim(),
      FKInterviewQuestionId: currentQuestion.PKTestQuestionId,
      FKCommentedBy: userId,
      FkCommentedUser: userName,
      ParentCommentId: parentCommentId
    };
    
    try {
      // TODO: Replace with actual API call
      // const result = await interviewQuestionService.AddComment(newReply);
      const result = 1; // Placeholder
      
      if (result === 1) {
        alert('Replied Successfully');
        setIsVisiblePostComment(-1);
        setReplyComment('');
        if (currentQuestion.PKTestQuestionId) {
          await fetchComments(currentQuestion.PKTestQuestionId, currentPageIndex);
        }
      } else {
        alert('Your Comments on this question has reached its limit today, please try again tomorrow');
      }
    } catch (error) {
      console.error('Error replying to comment:', error);
      alert('Failed to add reply');
    }
  }, [replyComment, userId, userName, currentQuestion, currentPageIndex, fetchComments]);

  const handleEditReply = useCallback(async (reply: CommentDTO) => {
    if (!editCommentField || editCommentField.trim().length < 2) {
      alert('Comment must be more than one character');
      return;
    }
    
    const updatedReply = { ...reply, Comment: editCommentField.trim() };
    
    try {
      // TODO: Replace with actual API call
      // await interviewQuestionService.EditReply(updatedReply);
      
      if (currentQuestion?.PKTestQuestionId) {
        await fetchComments(currentQuestion.PKTestQuestionId, currentPageIndex);
      }
      setEditCommentField('');
      setIsVisibleEditReply(-1);
    } catch (error) {
      console.error('Error editing reply:', error);
      alert('Failed to edit reply');
    }
  }, [editCommentField, currentQuestion, currentPageIndex, fetchComments]);

  const handleDeleteReply = useCallback(async (replyId: string) => {
    try {
      // TODO: Replace with actual API call
      // await interviewQuestionService.DeleteReply(replyId);
      
      if (currentQuestion?.PKTestQuestionId) {
        await fetchComments(currentQuestion.PKTestQuestionId, currentPageIndex);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    }
  }, [currentQuestion, currentPageIndex, fetchComments]);

  const handleReportComment = useCallback((commentId: string, commentedUserName: string) => {
    if (userRole === 'Admin') return;
    
    setReportCommentId(commentId);
    setCommentedUser(commentedUserName);
    setShowReportModal(true);
  }, [userRole]);

  const confirmReportComment = useCallback(async () => {
    if (!userId) return;
    
    const report: UsersCommentReport = {
      fkCommentId: reportCommentId,
      fkQuestionId: currentQuestion?.PKTestQuestionId,
      fkuserId: userId,
      pkReportId: '',
      reportCount: 1
    };
    
    try {
      // TODO: Replace with actual API call
      // const result = await interviewQuestionService.AddUsersCommentReport(report);
      const result = true; // Placeholder
      
      if (result) {
        alert('Reported successfully');
      } else {
        alert('Already reported');
      }
      setShowReportModal(false);
    } catch (error) {
      console.error('Error reporting comment:', error);
      alert('Failed to report comment');
      setShowReportModal(false);
    }
  }, [reportCommentId, currentQuestion, userId]);

  const toggleCommentExpand = useCallback((index: number) => {
    setComments(prev => prev.map((comment, idx) => 
      idx === index ? { ...comment, isExpanded: !comment.isExpanded } : comment
    ));
  }, []);

  const handleCommentInputChange = useCallback((value: string, isReply: boolean = false) => {
    const trimmedValue = value.trim();
    
    if (trimmedValue === '') {
      if (isReply) {
        setReplyComment('');
      } else {
        setCommentText('');
      }
      setIsCommentWhitespace(true);
    } else {
      if (isReply) {
        setReplyComment(value);
      } else {
        setCommentText(value);
      }
      setIsCommentWhitespace(false);
    }
  }, []);

  const paginateComments = useCallback(async (direction: 'next' | 'prev') => {
    if (!currentQuestion) return;
    
    const commentsPerPage = 5;
    const totalPages = Math.ceil(totalCommentsCount / commentsPerPage);
    
    let newPageIndex = currentPageIndex;
    
    if (direction === 'next' && currentPageIndex < totalPages) {
      newPageIndex = currentPageIndex + 1;
    } else if (direction === 'prev' && currentPageIndex > 1) {
      newPageIndex = currentPageIndex - 1;
    }
    
    if (newPageIndex !== currentPageIndex) {
      setCurrentPageIndex(newPageIndex);
      if (currentQuestion.PKTestQuestionId) {
        await fetchComments(currentQuestion.PKTestQuestionId, newPageIndex);
      }
    }
  }, [currentQuestion, currentPageIndex, totalCommentsCount, fetchComments]);



  // ===== FETCH TEST SUITE DETAILS =====
  useEffect(() => {
    let mounted = true;
    
    const fetchSuiteDetails = async () => {
      if (!PathId || !userId) return;
      
      try {
        console.log('Fetching test suite details for PathId:', PathId);
        
        const suiteDetails = await getTestSuiteByPathId(PathId, userId);
        if (!mounted) return;
        
        if (suiteDetails) {
          setTestSuiteDetails(suiteDetails);
          if (!testTitle) {
            setTestTitle(suiteDetails.TestSuiteTitle || 'Exam');
          }
        }
      } catch (error) {
        console.error('Error fetching suite details:', error);
      }
    };
    
    fetchSuiteDetails();
    
    return () => { mounted = false; };
  }, [PathId, userId]);

  // ===== CHECK SUBSCRIPTION AND CREDITS =====
  useEffect(() => {
    let mounted = true;
    
    const checkSubscription = async () => {
      if (!testId || !userId) return;
      
      try {
        setIsBDTCheckLoading(true);
        const subscribed = await isTestSubscribed(testId, userId, false);
        if (mounted) setIsSubscribed(subscribed);
        
        // Check BDT subscription only if userEmail and testTitle are available
          if (userEmail && testTitle) {
            const bdtSub = await checkBDTSubscription(userEmail, testTitle);
          if (mounted) setIsBDTUserSubscriber(bdtSub);
        }
        
        const balance = await getWalletBalance(undefined, false);
        if (mounted) setWalletBalance(balance);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        if (mounted) setIsBDTCheckLoading(false);
      }
    };
    
    checkSubscription();
    
    return () => { mounted = false; };
  }, [testId, userId, userEmail, testTitle]);

  // ===== FETCH TEST VIEW MODEL =====
  useEffect(() => {
    let mounted = true;
    
    const fetchTestViewModel = async () => {
      if (!testId || !userId) return;
      
      try {
        setLoading(true);
        const vm = await getTestViewModel(testId, userId, testMode, undefined, false);
        
        if (!mounted) return;
        
        if (vm && vm.Questions) {
          // Shuffle questions for students with subscription if exam not started
          const hasAnyAnswer = vm.Questions.some((q: Question) => q.QuestionStatus === QuestionStatus.IsAnswered || q.QuestionStatus === QuestionStatus.MarkedandAnswered);
          debugger;
          if (userRole === 'Student' && (isSubscribed || isBDTUserSubscriber) && !hasAnyAnswer) {
            vm.Questions = shuffleArray(vm.Questions);
          }
          
          // Calculate need credits (20% of questions)
          const totalQuestions = vm.Questions.length;
          const creditsNeeded = Math.ceil(totalQuestions * 0.2);
          setNeedCredits(creditsNeeded);
          
          // Lock questions if not subscribed
          if (!isSubscribed && !isBDTUserSubscriber && userRole === 'Student') {
            vm.Questions = vm.Questions.map((q: Question, idx: number) => ({
              ...q,
              Flag: idx < creditsNeeded
            }));
          } else {
            vm.Questions = vm.Questions.map((q: Question) => ({
              ...q,
              Flag: true
            }));
          }
          
          // Initialize timers
          if (vm.Mode === TestMode.Practice) {
            if (vm.TimeElapsedinSeconds === 0) {
              setMinutesCounter(0);
              setSecondsCounter(0);
            } else {
              setMinutesCounter(Math.floor(vm.TimeElapsedinSeconds / 60));
              setSecondsCounter(vm.TimeElapsedinSeconds % 60);
            }
          } else {
            if (vm.DefaultTimeinSecondsForEachQuestion) {
              setMinutesCounter(Math.floor((vm.DefaultTimeinSecondsForEachQuestion - vm.QuestionTimeElapsedinSeconds) / 60));
              setSecondsCounter((vm.DefaultTimeinSecondsForEachQuestion - vm.QuestionTimeElapsedinSeconds) % 60);
              setTotalMinutesCounter(Math.floor((vm.DurationinSeconds! - vm.TimeElapsedinSeconds) / 60));
              setTotalSecondsCounter((vm.DurationinSeconds! - vm.TimeElapsedinSeconds) % 60);
            } else {
              setMinutesCounter(Math.floor((vm.DurationinSeconds! - vm.TimeElapsedinSeconds) / 60));
              setSecondsCounter((vm.DurationinSeconds! - vm.TimeElapsedinSeconds) % 60);
            }
          }
          
          console.log('Test ViewModel loaded:', vm);
          setTestViewModel(vm);
          setCurrentIndex(vm.CurrentQuestionIndex || 0);
          setExamLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching test view model:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchTestViewModel();
    
    return () => { mounted = false; };
  }, [testId, userId, testMode, isSubscribed, isBDTUserSubscriber, userRole]);

  // ===== FETCH INITIAL QUESTION DATA =====
  useEffect(() => {
    if (!examLoaded || !testViewModel) return;
    
    const currentQuestion = testViewModel.Questions?.[currentIndex];
    // Only fetch if the question doesn't have options loaded yet
    if (currentQuestion?.options && currentQuestion.options.length > 0) {
      console.log('Question already has options, skipping fetch');
      return;
    }
    
    const fetchInitialQuestion = async () => {
      try {
        const payload = buildApiPayload(testViewModel, currentIndex);
        
        if (!payload) {
          console.error('Failed to build initial payload');
          return;
        }
        
        console.log('Fetching initial question data for index:', currentIndex);
        const questionData = await getCurrentExamQuestion(false, false, payload, false);
        console.log('Initial question data received:', questionData);
        
        if (questionData) {
          // Update the current question with the fetched data
          const updatedQuestions = [...testViewModel.Questions];
          const existingQuestion = updatedQuestions[currentIndex];
          
          // Determine the selected option IDs (prefer existing, then from API)
          const selectedOptionId = existingQuestion?.SelectedOptionId ?? questionData.SelectedOptionId ?? '';
          const selectedIds = selectedOptionId.split(',').filter(Boolean);
          
          // Get options from API response
          const apiOptions = questionData.options || questionData.Options || [];
          
          // Merge options while setting selection state based on SelectedOptionId
          const mergedOptions = apiOptions.map((newOption: any, optIdx: number) => {
            const existingOption = existingQuestion?.options?.[optIdx];
            // Check if this option's ID is in the selected IDs
            const isSelected = selectedIds.includes(String(newOption.PKOptionId || newOption.pkOptionId || ''));
            
            return {
              ...newOption,
              // Set selection based on SelectedOptionId, fallback to existing state
              isSelectedOption: isSelected || existingOption?.isSelectedOption || newOption.isSelectedOption || false
            };
          });
          
          updatedQuestions[currentIndex] = {
            ...(existingQuestion || {}),
            Description: questionData.Description || existingQuestion?.Description,
            ImageUrl: questionData.ImageUrl || existingQuestion?.ImageUrl,
            options: mergedOptions,
            ModuleName: questionData.ModuleName || existingQuestion?.ModuleName,
            Explanation: questionData.Explanation || existingQuestion?.Explanation,
            CourseURL: questionData.CourseURL || existingQuestion?.CourseURL,
            ThumbNailes: questionData.ThumbNailes || existingQuestion?.ThumbNailes,
            // Preserve question state
            QuestionStatus: existingQuestion?.QuestionStatus ?? questionData.QuestionStatus,
            isMarkedforReview: existingQuestion?.isMarkedforReview ?? questionData.isMarkedforReview,
            SelectedOptionId: selectedOptionId,
            PKTestQuestionId: existingQuestion?.PKTestQuestionId ?? questionData.PKTestQuestionId
          };
          
          setTestViewModel({
            ...testViewModel,
            Questions: updatedQuestions
          });
        }
      } catch (error) {
        console.error('Failed to fetch initial question:', error);
      }
    };
    
    fetchInitialQuestion();
  }, [examLoaded, testViewModel, currentIndex, getCurrentExamQuestion]); // Re-run when exam loads or testViewModel/currentIndex changes

  // ===== START TIMERS =====
  useEffect(() => {
    if (!examLoaded || isPaused) return;
    
    startTimer();
    
    if (quizWithQuestionTimer) {
      startTotalTimer();
    }
    
    return () => {
      pauseTimer();
      if (quizWithQuestionTimer) {
        pauseTotalTimer();
      }
    };
  }, [examLoaded, isPaused, startTimer, startTotalTimer, pauseTimer, pauseTotalTimer, quizWithQuestionTimer]);

  // ===== AUTO-FINISH ON TIMER END =====
  useEffect(() => {
    if (testMode !== TestMode.Quiz) return;
    if (isExamOver) return;
    
    // Check for exam timeout
    if (testViewModel?.DefaultTimeinSecondsForEachQuestion === 0) {
      // No per-question timer, check total timer
      if (minutesCounter === 0 && secondsCounter === 0) {
        handleFinish();
      }
    } else {
      // Per-question timer mode
      if (quizWithQuestionTimer) {
        // Check total exam timer
        if (totalMinutesCounter === 0 && totalSecondsCounter === 0) {
          handleFinish();
        }
        // Auto-advance to next question when question timer expires
        else if (minutesCounter === 0 && secondsCounter === 0) {
          if (currentIndex < questions.length - 1) {
            // Reset question timer and move to next
            if (testViewModel) {
              testViewModel.QuestionTimeElapsedinSeconds = 0;
            }
            goToQuestion(currentIndex + 1);
          } else {
            // Last question and timer expired
            handleFinish();
          }
        }
      }
    }
  }, [minutesCounter, secondsCounter, totalMinutesCounter, totalSecondsCounter, testMode, isExamOver, testViewModel, quizWithQuestionTimer, currentIndex, questions.length, handleFinish, goToQuestion]);

  // ===== BEFORE UNLOAD - SAVE PROGRESS =====
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (testViewModel && !isExamOver) {
        // Save progress before leaving
        updateBuyerTest(false);
        
        // Store reload flag
        localStorage.setItem('Reloaded', 'true');
        localStorage.setItem('CurrentTestMode', testMode.toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testViewModel, isExamOver, testMode, updateBuyerTest]);

  // ===== FETCH COMMENTS WHEN QUESTION CHANGES =====
  useEffect(() => {
    if (currentQuestion?.PKTestQuestionId) {
      setCurrentPageIndex(1);
      fetchComments(currentQuestion.PKTestQuestionId, 1);
    }
  }, [currentQuestion?.PKTestQuestionId, fetchComments]);

  // ===== NETWORK STATUS MONITORING =====
  useEffect(() => {
    const handleOnline = () => setIsOfflineOrOnlineStatus(true);
    const handleOffline = () => setIsOfflineOrOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOfflineOrOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ===== PREVENT COPY/PASTE AND RIGHT-CLICK =====
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert('You are not allowed to do that');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Cmd+C, Cmd+V
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
        e.preventDefault();
        alert('You are not allowed to do that');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (totalTimerIntervalRef.current) clearInterval(totalTimerIntervalRef.current);
    };
  }, []);

  // ===== RENDER =====
  if (loading || !examLoaded || isBDTCheckLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <Skeleton className="h-8 w-2/3 mb-4" />
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                {/* Question Header */}
                <div className="flex justify-between items-center mb-6">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-10 w-24" />
                </div>
                
                {/* Question Content */}
                <div className="mb-6">
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-6 w-5/6 mb-3" />
                  <Skeleton className="h-6 w-4/6" />
                </div>

                {/* Question Image Placeholder */}
                <Skeleton className="h-64 w-full mb-6" rounded="rounded-lg" />

                {/* Options */}
                <div className="space-y-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <Skeleton className="h-5 w-3/4" />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Skeleton className="h-12 flex-1" rounded="rounded-md" />
                  <Skeleton className="h-12 w-32" rounded="rounded-md" />
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10" rounded="rounded-md" />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${isPaused ? 'blur-sm' : ''}`}>
      {/* Inject CSS for HTML content */}
      <style>{htmlContentStyles}</style>
     
      {/* Main Content */}
      <div className="p-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 hidden md:block">
          <ol className="flex items-center gap-2 text-sm text-text-secondary">
            <li>
              <Link to="/" className="hover:text-primary-blue">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/exams" className="hover:text-primary-blue">Tests</Link>
            </li>
            <li>/</li>
            <li>
              <button 
                onClick={handleClose}
                className="hover:text-primary-blue"
              >
                {testTitle}
              </button>
            </li>
            <li>/</li>
            <li className="font-semibold text-text-primary">
              {testMode === TestMode.Quiz ? 'Quiz' : 'Practice'}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {testTitle} ({testMode === TestMode.Quiz ? 'Quiz' : 'Practice'})
          </h1>
          {!isSubscribed && !isBDTUserSubscriber && (
            <Button
              variant={walletBalance >= (testSuiteDetails?.TotalPriceInDollars || 0) ? 'primary' : 'secondary'}
              onClick={handleUnlock}
              className="whitespace-nowrap"
            >
              Unlock Questions
            </Button>
          )}
        </div>

        {/* Timer (Quiz with total timer) */}
        {quizWithQuestionTimer && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg mb-4 text-center font-semibold">
            Time Left: {formatTime(totalMinutesCounter * 60 + totalSecondsCounter)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-9">
            {isQuestionLoading ? (
              <div className="bg-white rounded-xl shadow-md border border-border p-6">
                {/* Question Header Skeleton */}
                <div className="flex justify-between items-center mb-6">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-10 w-32" />
                </div>
                
                {/* Question Content Skeleton */}
                <div className="mb-6">
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-6 w-5/6 mb-3" />
                  <Skeleton className="h-6 w-4/6" />
                </div>

                {/* Options Skeleton */}
                <div className="space-y-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <Skeleton className="h-5 w-3/4" />
                    </div>
                  ))}
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex justify-between gap-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                  <Skeleton className="h-12 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-xl shadow-md border border-border p-6">
              {/* Question Header */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">
                    Question: <span className="text-primary-blue">
                      {String(currentIndex + 1).padStart(2, '0')} of {questions.length}
                    </span>
                  </span>
                  <span className="text-sm bg-light-blue text-primary-blue px-3 py-1 rounded-md">
                    <strong>Domain:</strong> {currentQuestion?.ModuleName || testTitle}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                    <FaClock />
                    <span>
                      {testMode === TestMode.Practice ? 'Time: ' : 
                       testViewModel?.DefaultTimeinSecondsForEachQuestion ? 'Time for this Question: ' : 'Time Left: '}
                      {formatTime(minutesCounter * 60 + secondsCounter)}
                    </span>
                  </div>
                  
                  {testMode === TestMode.Quiz && !quizWithQuestionTimer && (
                    <button
                      onClick={handlePause}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      title="Pause"
                    >
                      <FaPause className="text-gray-700" />
                    </button>
                  )}
                  
                  {testMode === TestMode.Practice && (
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                      title="Close"
                    >
                      <FaTimes className="text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              {currentQuestion?.Description ? (
                <div 
                  className="html-content prose prose-sm md:prose-base max-w-none mb-6"
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: currentQuestion.Description }}
                />
              ) : ''}

              {/* Question Image */}
              {currentQuestion?.ImageUrl && (
                <img 
                  src={currentQuestion.ImageUrl} 
                  alt="Question" 
                  className="max-w-full h-auto rounded-lg mb-6"
                />
              )}

              {/* Options Instruction */}
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 mb-4 rounded">
                {isCheckBox ? 'Please select all correct answers' : 'Please select the correct answer'}
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion?.options && currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((option, idx) => {
                    const isSelected = option.isSelectedOption;
                    const isCorrect = showAnswerClicked && option.IsCorrect;
                    const isWrong = showAnswerClicked && isSelected && !option.IsCorrect;
                    
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                          ${isWrong ? 'border-red-500 bg-red-50' : ''}
                          ${!showAnswerClicked && isSelected ? 'border-primary-blue bg-light-blue' : ''}
                          ${!showAnswerClicked && !isSelected ? 'border-border hover:border-primary-blue' : ''}
                        `}
                      >
                        <input
                          type={isCheckBox ? 'checkbox' : 'radio'}
                          checked={isSelected || false}
                          onChange={() => handleOptionChange(idx)}
                          disabled={isPaused || isExamOver}
                          className="mt-1"
                        />
                        <div className="flex items-start gap-3 flex-1">
                          <span className="font-semibold text-text-secondary flex-shrink-0">
                            {alphabets[idx]}.
                          </span>
                          {option.Description ? (
                            <div 
                              className="html-content prose prose-sm max-w-none flex-1"
                              style={{
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                              dangerouslySetInnerHTML={{ __html: option.Description }}
                            />
                          ) : (
                            <span className="flex-1">Option {alphabets[idx]}</span>
                          )}
                        </div>
                        {option.ImageUrl && (
                          <img 
                            src={option.ImageUrl} 
                            alt={`Option ${alphabets[idx]}`}
                            className="max-w-xs h-auto rounded"
                          />
                        )}
                      </label>
                    );
                  })
                ) : ''}
              </div>

              {/* Show Answer Button (Practice Mode) */}
              {testMode === TestMode.Practice && (
                <div className="mb-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAnswerClicked(!showAnswerClicked)}
                    className="w-full"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {showAnswerClicked ? (
                        <>Hide Answer <FaMinus /></>
                      ) : (
                        <>Show Answer <FaPlus /></>
                      )}
                    </span>
                  </Button>
                </div>
              )}

              {/* Answer Explanation */}
              {(testMode === TestMode.Practice || isExamOver) && showAnswerClicked && (
                <div className="bg-gray-50 border border-border rounded-xl p-6 mb-6">
                  <div className="mb-4">
                    <strong className="text-lg">Correct Answer{isCheckBox ? 's' : ''}: </strong>
                    <span className="text-primary-blue font-semibold">
                      {currentQuestion?.options
                        ?.map((opt, idx) => opt.IsCorrect ? alphabets[idx] : null)
                        .filter(Boolean)
                        .join(', ') || 'Not available'}
                    </span>
                  </div>
                  
                  {currentQuestion?.Explanation && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-lg mb-3">Explanation:</h4>
                      <div 
                        className="html-content prose prose-sm md:prose-base max-w-none"
                        style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{ __html: currentQuestion.Explanation }}
                      />
                    </div>
                  )}

                  {/* Related Course */}
                  {currentQuestion?.CourseURL && currentQuestion?.ThumbNailes && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Related Courses:</h4>
                      <a 
                        href={currentQuestion.CourseURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-xs"
                      >
                        <img 
                          src={currentQuestion.ThumbNailes}
                          alt="Course"
                          className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        />
                        <p className="text-center mt-2 text-primary-blue font-semibold">
                          {testTitle}
                        </p>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleFirst}
                    disabled={currentIndex === 0 || isPaused || (testViewModel?.DefaultTimeinSecondsForEachQuestion !== 0 && testMode === TestMode.Quiz)}
                  >
                    <FaAngleDoubleLeft />
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || isPaused || (testViewModel?.DefaultTimeinSecondsForEachQuestion !== 0 && testMode === TestMode.Quiz) || (!isBDTUserSubscriber && !isSubscribed && currentIndex > needCredits)}
                  >
                    <FaAngleLeft />
                  </Button>
                </div>

                <Button
                  variant="primary"
                  onClick={handleFinish}
                  disabled={isPaused}
                  className="!bg-green-600 hover:!bg-green-700"
                >
                  Finish
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1 || isPaused || (!isSubscribed && currentIndex >= needCredits - 1 && !isBDTUserSubscriber)}
                  >
                    <FaAngleRight />
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleLast}
                    disabled={currentIndex === questions.length - 1 || isPaused || (testViewModel?.DefaultTimeinSecondsForEachQuestion !== 0 && testMode === TestMode.Quiz) || (!isSubscribed && !isBDTUserSubscriber)}
                  >
                    <FaAngleDoubleRight />
                  </Button>
                </div>
              </div>

              {/* Comments Section Placeholder */}
              <div className="mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-primary-blue font-semibold hover:underline flex items-center gap-2 mb-4"
                >
                  <FaReply />
                  {totalCommentsCount} Comment{totalCommentsCount !== 1 ? 's' : ''}
                </button>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => handleCommentInputChange(e.target.value, false)}
                      placeholder="Enter your comment here..."
                      className="w-full border border-border rounded-lg p-3 min-h-[80px] focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="small"
                        disabled={!commentText || commentText.trim().length < 2 || isCommentWhitespace}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                {showComments && (
                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      <>
                        {comments.map((comment, commentIdx) => (
                          <div key={comment.PKCommentId} className="bg-gray-50 rounded-lg p-4 border border-border">
                            {/* Comment Content */}
                            {!comment.IsEdit ? (
                              <div>
                                <div className="flex items-start gap-2 mb-2">
                                  <FaReply className="text-primary-blue mt-1" />
                                  <p className="flex-1 text-text-primary">{comment.Comment}</p>
                                </div>
                                <p className="text-xs text-text-secondary ml-6">
                                  On {new Date(comment.CommentedDate || '').toLocaleDateString()} by {comment.FkCommentedUser}
                                  {comment.FKCommentedBy === userId && (
                                    <>
                                      <button
                                        onClick={() => handleEditComment(comment)}
                                        className="ml-2 text-primary-blue hover:underline"
                                      >
                                        <FaEdit className="inline" />
                                      </button>
                                    </>
                                  )}
                                  {(comment.FKCommentedBy === userId || userRole === 'Admin') && (
                                    <button
                                      onClick={() => handleDeleteComment(comment)}
                                      className="ml-2 text-red-600 hover:underline"
                                    >
                                      <FaTrash className="inline" />
                                    </button>
                                  )}
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={comment.Comment}
                                  onChange={(e) => {
                                    const newComments = [...comments];
                                    newComments[commentIdx].Comment = e.target.value;
                                    setComments(newComments);
                                  }}
                                  className="border border-border rounded px-3 py-2"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="small"
                                    variant="primary"
                                    onClick={() => handleUpdateComment(comment)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="secondary"
                                    onClick={() => handleCancelEdit(comment)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Comment Actions */}
                            <div className="flex items-center gap-4 mt-3 ml-6 text-sm">
                              <button
                                onClick={() => handleVoteComment(comment)}
                                className="flex items-center gap-1 text-text-secondary hover:text-primary-blue"
                              >
                                <FaThumbsUp /> {comment.Votes || 0}
                              </button>
                              <button
                                onClick={() => setIsVisiblePostComment(isVisiblePostComment === commentIdx ? -1 : commentIdx)}
                                className="flex items-center gap-1 text-text-secondary hover:text-primary-blue"
                              >
                                <FaReply /> {comment.RepliesCount || 0}
                              </button>
                              {comment.FKCommentedBy !== userId && userRole !== 'Admin' && (
                                <button
                                  onClick={() => handleReportComment(comment.PKCommentId || '', comment.FkCommentedUser)}
                                  className="flex items-center gap-1 text-text-secondary hover:text-red-600"
                                >
                                  <FaFlag />
                                  {userRole === 'Admin' && <span className="text-red-600">({comment.ReportCount})</span>}
                                </button>
                              )}
                            </div>

                            {/* Expand/Collapse Replies */}
                            {(comment.Replies?.length || 0) > 0 && (
                              <button
                                onClick={() => toggleCommentExpand(commentIdx)}
                                className="ml-6 mt-2 text-sm text-primary-blue hover:underline flex items-center gap-1"
                              >
                                {comment.isExpanded ? <FaMinus /> : <FaPlus />}
                                {comment.isExpanded ? 'Hide' : 'Show'} Replies
                              </button>
                            )}

                            {/* Replies */}
                            {comment.isExpanded && comment.Replies && (
                              <div className="ml-8 mt-3 space-y-3 border-l-2 border-gray-300 pl-4">
                                {comment.Replies.map((reply, replyIdx) => (
                                  <div key={reply.PKCommentId} className="bg-white rounded p-3">
                                    <div className="flex items-start gap-2">
                                      <span className="text-primary-blue">→</span>
                                      <div className="flex-1">
                                        {isVisibleEditReply !== replyIdx ? (
                                          <>
                                            <p className="text-text-primary">{reply.Comment}</p>
                                            <p className="text-xs text-text-secondary mt-1">
                                              On {new Date(reply.CommentedDate || '').toLocaleDateString()} by {reply.FkCommentedUser}
                                              {reply.FKCommentedBy === userId && (
                                                <button
                                                  onClick={() => {
                                                    setIsVisibleEditReply(replyIdx);
                                                    setEditCommentField(reply.Comment);
                                                  }}
                                                  className="ml-2 text-primary-blue hover:underline"
                                                >
                                                  <FaEdit className="inline" />
                                                </button>
                                              )}
                                              {(reply.FKCommentedBy === userId || userRole === 'Admin') && (
                                                <button
                                                  onClick={() => reply.PKCommentId && handleDeleteReply(reply.PKCommentId)}
                                                  className="ml-2 text-red-600 hover:underline"
                                                >
                                                  <FaTrash className="inline" />
                                                </button>
                                              )}
                                            </p>
                                          </>
                                        ) : (
                                          <div className="flex flex-col gap-2">
                                            <input
                                              type="text"
                                              value={editCommentField}
                                              onChange={(e) => handleCommentInputChange(e.target.value, true)}
                                              className="border border-border rounded px-3 py-2"
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="small"
                                                variant="primary"
                                                onClick={() => handleEditReply(reply)}
                                                disabled={isCommentWhitespace}
                                              >
                                                Save
                                              </Button>
                                              <Button
                                                size="small"
                                                variant="secondary"
                                                onClick={() => setIsVisibleEditReply(-1)}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Form */}
                            {isVisiblePostComment === commentIdx && (
                              <div className="ml-8 mt-3">
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="text"
                                    value={replyComment}
                                    onChange={(e) => handleCommentInputChange(e.target.value, true)}
                                    placeholder="Enter your reply here..."
                                    className="border border-border rounded px-3 py-2"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="small"
                                      variant="primary"
                                      onClick={() => comment.PKCommentId && handleReplyComment(comment.PKCommentId)}
                                      disabled={!replyComment || replyComment.trim().length < 2 || isCommentWhitespace}
                                    >
                                      Post
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Pagination */}
                        {totalCommentsCount > 5 && (
                          <div className="flex justify-center gap-4 mt-6">
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => paginateComments('prev')}
                              disabled={currentPageIndex === 1}
                            >
                              <FaAngleLeft />
                            </Button>
                            <span className="flex items-center text-text-secondary">
                              Page {currentPageIndex}
                            </span>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => paginateComments('next')}
                              disabled={currentPageIndex >= Math.ceil(totalCommentsCount / 5)}
                            >
                              <FaAngleRight />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-center text-text-secondary py-8">No comments available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Right Sidebar - Question Numbers */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md border border-border p-6 sticky top-4">
              {/* Mark for Review */}
              {!quizWithQuestionTimer && (
                <div className="text-center mb-4">
                  <label className="flex items-center justify-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentQuestion?.isMarkedforReview || false}
                      onChange={(e) => handleMarkForReview(e.target.checked)}
                    />
                    <span className="font-semibold">Mark for Review</span>
                  </label>
                </div>
              )}

              <hr className="my-4 border-border" />

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const status = q.QuestionStatus || QuestionStatus.None;
                  const isAnswered = status === QuestionStatus.IsAnswered || status === QuestionStatus.MarkedandAnswered;
                  const isMarked = status === QuestionStatus.IsMarkedForReview || status === QuestionStatus.MarkedandAnswered;
                  const isCurrent = idx === currentIndex;
                  const isLocked = !q.Flag;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => q.Flag ? goToQuestion(idx) : handleUnlock()}
                      className={`h-12 rounded-md font-semibold transition-all relative
                        ${isCurrent ? 'ring-2 ring-primary-blue ring-offset-2' : ''}
                        ${isLocked ? 'bg-gray-300 text-gray-600' : ''}
                        ${!isLocked && isAnswered && !isMarked ? 'bg-green-500 text-white' : ''}
                        ${!isLocked && isMarked ? 'bg-yellow-500 text-white' : ''}
                        ${!isLocked && !isAnswered && !isMarked ? 'bg-gray-100 text-text-primary' : ''}
                      `}
                      disabled={isPaused}
                    >
                      {isLocked ? <FaLock className="mx-auto" /> : idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Exam Paused</h2>
            {testViewModel?.DefaultTimeinSecondsForEachQuestion === 0 && (
              <p className="mb-2">
                Time Left: <strong>{formatTime(minutesCounter * 60 + secondsCounter)}</strong>
              </p>
            )}
            {quizWithQuestionTimer && (
              <>
                <p className="mb-2">
                  Time Left for this Question: <strong>{formatTime(minutesCounter * 60 + secondsCounter)}</strong>
                </p>
                <p className="mb-2">
                  Time Left for the Exam: <strong>{formatTime(totalMinutesCounter * 60 + totalSecondsCounter)}</strong>
                </p>
              </>
            )}
            <Button
              variant="primary"
              onClick={handleResume}
              className="mt-6 !px-8"
            >
              <FaPlay className="mr-2" /> Resume
            </Button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Review</h2>
            
            <div className="mb-6">
              <p className="mb-3 font-semibold">
                How satisfied were you with this practice exam on a scale of 5?
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl transition-colors"
                  >
                    <span className={star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-3 font-semibold">
                How helpful will this test be for your Certification?
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="helpfulness"
                    value="Worth taking it"
                    checked={testHelpfulness === 'Worth taking it'}
                    onChange={(e) => setTestHelpfulness(e.target.value)}
                  />
                  <span>Worth taking it</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="helpfulness"
                    value="Might be Helpful"
                    checked={testHelpfulness === 'Might be Helpful'}
                    onChange={(e) => setTestHelpfulness(e.target.value)}
                  />
                  <span>Might be Helpful</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="helpfulness"
                    value="Not Much"
                    checked={testHelpfulness === 'Not Much'}
                    onChange={(e) => setTestHelpfulness(e.target.value)}
                  />
                  <span>Not Much</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-3 font-semibold">Describe your Experience</p>
              <textarea
                value={testReview}
                onChange={(e) => setTestReview(e.target.value)}
                className="w-full border border-border rounded-lg p-3 min-h-[120px]"
                placeholder="Share your feedback..."
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowReviewModal(false)}
              >
                Skip
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitReview}
                disabled={!rating}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Unlock Questions</h2>
            <p className="mb-6">
              You have a balance of <strong>{walletBalance}</strong> credits and{' '}
              <strong>{testSuiteDetails?.TotalPriceInDollars || 0}</strong> credit(s) will be deducted from your credits.
            </p>
            <p className="text-sm text-text-secondary mb-6">
              To continue learning from exam dumps, purchase the exam bundle!
            </p>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowUnlockModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmUnlock}
                className="flex-1"
                disabled={walletBalance < (testSuiteDetails?.TotalPriceInDollars || 0)}
              >
                Confirm Purchase
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Delete Comment</h2>
            <p className="mb-6">Are you sure you want to delete this comment?</p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="primary"
                onClick={confirmDeleteComment}
              >
                Yes
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteCommentData(null);
                }}
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Comment Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Report Comment</h2>
            <p className="mb-6">
              Is the comment made by <strong>{commentedUser}</strong> Spam or Abusive?
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                variant="primary"
                onClick={confirmReportComment}
              >
                Yes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowReportModal(false)}
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Network Offline Warning */}
      {!isOfflineOrOnlineStatus && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="font-semibold">⚠️ No Internet Connection</p>
          <p className="text-sm">Please check your network and try again</p>
        </div>
      )}
    </div>
  );
};

export default PracticeExam;
