import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getExamTopics } from '../data/examTopics';
import Button from '@shared/components/ui/Button';
import { FaClock, FaTimes, FaPause, FaPlay, FaThumbsUp, FaFlag, FaEdit, FaTrash, FaReply, FaPlus, FaMinus, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaLock, FaCheck } from 'react-icons/fa';
import { useTestSuitesApi } from '@shared/api/testSuites';
import { useTestsApi } from '@shared/api/tests';
import { useAuth } from '@features/auth/context/AuthContext';
import { useAuthApi } from '@shared/api/auth';
import { useWalletApi } from '@shared/api/wallet';
import { getUserIdFromClaims } from '@shared/utils/auth';

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
}

// ===== UTILITY FUNCTIONS =====
const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ===== MAIN COMPONENT =====
const PracticeExam: React.FC = () => {
  const navigate = useNavigate();
  const { code, sectionId } = useParams();
  const [searchParams] = useSearchParams();
  const qpTestId = searchParams.get('testId') || null;
  const modeParam = searchParams.get('mode') || '0';
  
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

  // ===== STATE MANAGEMENT =====
  // Basic state
  const [testId, setTestId] = useState<string | null>(qpTestId);
  const [pathIdResolved, setPathIdResolved] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isBDTUserSubscriber, setIsBDTUserSubscriber] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [testSuiteDetails, setTestSuiteDetails] = useState<any>(null);
  const [testTitle, setTestTitle] = useState<string>('');
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
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [testHelpfulness, setTestHelpfulness] = useState('');
  const [testReview, setTestReview] = useState('');
  
  // Payment modal state
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // ===== COMPUTED VALUES =====
  const questions = useMemo(() => testViewModel?.Questions || [], [testViewModel]);
  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
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
    
    setCurrentIndex(index);
    setShowAnswerClicked(false);
    
    // Build proper payload for API
    const payload = {
      ...testViewModel,
      CurrentQuestionIndex: index,
      PreviousQuestion: testViewModel.Questions[currentIndex],
      Questions: testViewModel.Questions.map(q => ({
        QuestionId: q.PKTestQuestionId,
        SelectedOptionId: q.SelectedOptionId || null,
        QuestionStatus: q.QuestionStatus || 0,
        MarksScoredForthisQuestion: 0
      }))
    };
    
    // Persist to backend
    try {
        debugger;
      console.log('Calling getCurrentExamQuestion with payload:', payload);
      const response = await getCurrentExamQuestion(isExamOver, false, payload);
      console.log('getCurrentExamQuestion response:', response);
      
      if (response) {
        // The response should be the updated TestViewModel
        setTestViewModel({
          ...response,
          CurrentQuestionIndex: index
        });
      }
    } catch (error) {
      console.error('Failed to fetch question data:', error);
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
    
    // Persist to backend (fire and forget)
    try {
      const payload = {
        ...testViewModel,
        CurrentQuestionIndex: currentIndex,
        PreviousQuestion: testViewModel.Questions[currentIndex],
        Questions: updatedQuestions.map(q => ({
          QuestionId: q.PKTestQuestionId,
          SelectedOptionId: q.SelectedOptionId || null,
          QuestionStatus: q.QuestionStatus || 0,
          MarksScoredForthisQuestion: 0
        }))
      };
      await getCurrentExamQuestion(false, true, payload);
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
    
    const payload = {
      ...testViewModel,
      CurrentQuestionIndex: currentIndex,
      PreviousQuestion: testViewModel.Questions[currentIndex],
      Status: isFinish ? TestStatus.Completed : testViewModel.Status,
      Questions: testViewModel.Questions.map(q => ({
        QuestionId: q.PKTestQuestionId,
        SelectedOptionId: q.SelectedOptionId || null,
        QuestionStatus: q.QuestionStatus || 0,
        MarksScoredForthisQuestion: 0
      }))
    };
    
    try {
      const response = await getCurrentExamQuestion(isFinish,false, payload);
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
      navigate(`/exams/${code}`);
    }
  }, [rating, testHelpfulness, testReview, testViewModel, navigate, code]);

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
    
    // Navigate back to test details
    navigate(`/exams/${code}/${sectionId}`);
  }, [pauseTimer, pauseTotalTimer, quizWithQuestionTimer, updateBuyerTest, navigate, code, sectionId]);

  // ===== UNLOCK QUESTIONS =====
  const handleUnlock = useCallback(() => {
    setShowUnlockModal(true);
  }, []);

  const handleConfirmUnlock = useCallback(async () => {
    // Implement payment logic here
    console.log('Unlocking questions for:', testSuiteDetails?.TotalPriceInDollars);
    setShowUnlockModal(false);
  }, [testSuiteDetails]);

  // ===== SECURITY FEATURES =====
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert('You are not allowed to do that');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
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

  // ===== FETCH TEST SUITE DETAILS =====
  useEffect(() => {
    let mounted = true;
    
    const fetchSuiteDetails = async () => {
      if (!code || !userId) return;
      
      try {
        const suites = await globalSearch(code, 0, 5);
        const suiteHit = suites?.[0];
        const pathId = suiteHit?.PathId || `${code}:${(topic?.title || '').replace(/[^A-Za-z0-9]+/g, '')}`;
        
        if (!mounted) return;
        setPathIdResolved(pathId);
        
        const suiteDetails = pathId ? await getTestSuiteByPathId(pathId, userId) : null;
        if (!mounted) return;
        
        if (suiteDetails) {
          setTestSuiteDetails(suiteDetails);
          setTestTitle(suiteDetails.TestSuiteTitle || topic?.title || 'Exam');
          
          const test = (qpTestId && suiteDetails?.TestsDetailsDTO?.find((t: any) => t.PKTestId === qpTestId))
            || suiteDetails?.TestsDetailsDTO?.find((t: any) => t.PathId === sectionId)
            || suiteDetails?.TestsDetailsDTO?.[0];
          
          if (test) {
            setTestId(test.PKTestId);
          }
        }
      } catch (error) {
        console.error('Error fetching suite details:', error);
      }
    };
    
    fetchSuiteDetails();
    
    return () => { mounted = false; };
  }, [code, sectionId, userId, qpTestId, topic]);

  // ===== CHECK SUBSCRIPTION AND CREDITS =====
  useEffect(() => {
    let mounted = true;
    
    const checkSubscription = async () => {
      if (!testId || !userId) return;
      
      try {
        const subscribed = await isTestSubscribed(testId, userId);
        if (mounted) setIsSubscribed(subscribed);
        
        // Check BDT subscription (implement actual API call)
        // const bdtSub = await checkBDTSubscription(userEmail, testTitle);
        // if (mounted) setIsBDTUserSubscriber(bdtSub);
        
        const balance = await getWalletBalance();
        if (mounted) setWalletBalance(balance);
      } catch (error) {
        console.error('Error checking subscription:', error);
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
        const vm = await getTestViewModel(testId, userId, testMode);
        
        if (!mounted) return;
        
        if (vm && vm.Questions) {
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
    
    const fetchInitialQuestion = async () => {
      try {
        const payload = {
          ...testViewModel,
          CurrentQuestionIndex: currentIndex,
          PreviousQuestion: {},
          Questions: testViewModel.Questions.map(q => ({
            QuestionId: q.PKTestQuestionId,
            SelectedOptionId: q.SelectedOptionId || null,
            QuestionStatus: q.QuestionStatus || 0,
            MarksScoredForthisQuestion: 0
          }))
        };
        
        console.log('Fetching initial question data');
        const response = await getCurrentExamQuestion(false, false, payload);
        console.log('Initial question response:', response);
        
        if (response) {
          setTestViewModel({
            ...response,
            CurrentQuestionIndex: currentIndex
          });
        }
      } catch (error) {
        console.error('Failed to fetch initial question:', error);
      }
    };
    
    fetchInitialQuestion();
  }, [examLoaded]); // Only run once when exam loads

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

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (totalTimerIntervalRef.current) clearInterval(totalTimerIntervalRef.current);
    };
  }, []);

  // ===== RENDER =====
  if (loading || !examLoaded) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${isPaused ? 'blur-sm' : ''}`}>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Link to="/" className="hover:text-primary-blue">Home</Link>
          <span>/</span>
          <Link to="/exams" className="hover:text-primary-blue">Tests</Link>
          <span>/</span>
          <Link to={`/exams/${code}`} className="hover:text-primary-blue">{testTitle}</Link>
          <span>/</span>
          <strong className="text-text-primary">
            {testMode === TestMode.Quiz ? 'Quiz' : 'Practice'}
          </strong>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
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
                    <strong>Domain:</strong> {currentQuestion?.ModuleName || topic?.title}
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
                  className="prose max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.Description }}
                />
              ) : (
                <p className="text-lg mb-6 text-text-primary">Question text not available</p>
              )}

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
                {currentQuestion?.options?.map((option, idx) => {
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
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-semibold text-text-secondary">
                          {alphabets[idx]}.
                        </span>
                        {option.Description ? (
                          <div 
                            className="prose max-w-none flex-1"
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
                })}
              </div>

              {/* Show Answer Button (Practice Mode) */}
              {testMode === TestMode.Practice && (
                <div className="mb-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAnswerClicked(!showAnswerClicked)}
                    className="w-full"
                  >
                    {showAnswerClicked ? (
                      <>Hide Answer <FaMinus className="ml-2" /></>
                    ) : (
                      <>Show Answer <FaPlus className="ml-2" /></>
                    )}
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
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.Explanation }}
                    />
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
                  className="text-primary-blue font-semibold hover:underline"
                >
                  {totalCommentsCount} Comment{totalCommentsCount !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
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
    </div>
  );
};

export default PracticeExam;
