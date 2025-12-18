import { useApiService } from '@shared/api/api';
import { parseJwt, normalizeClaims } from '@shared/utils/auth';

const isDev = process.env.NODE_ENV === 'development';
export interface UserTestSubscription {
  TestId: string;
  TestName: string;
  TestStartDate: string;
  TestEndDate: string;
  PathId: string;
  totalCountQues: number;
  AttemptQsPercentage: number;
  IsCareerStep: boolean;
}

export const useTestsApi = () => {
  const api = useApiService();

  const getTestsByUserId = async (userId: string, email: string): Promise<UserTestSubscription[]> => {
    
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/TestBuyerSubscription/GetUsersTestSubscriptionsByUserId/${encodeURIComponent(userId)}/${encodeURIComponent(email)}/User`;
    try {
      const data = await api.get(endpoint, true);
      if (!data) return [];
      if (Array.isArray(data)) return data as UserTestSubscription[];
      // Some APIs wrap payloads; attempt to unwrap common shapes
      if (Array.isArray((data as any)?.data)) return (data as any).data as UserTestSubscription[];
      return [];
    } catch (error) {
      console.error('Failed to fetch user test subscriptions:', error);
      return [];
    }
  };

  // Fetch the Test View Model for a given TestId and UserId
  // POST: /api/BuyerTest/GetTestViewModel/{skip}/{testId}/{userId}
  const getTestViewModel = async (
    testId: string,
    userId: string,
    skip: number = 0,
    body?: {
      CurrentQuestionIndex?: number;
      Questions?: Array<{
        QuestionId: string;
        SelectedOptionId: string | null;
        QuestionStatus: number;
        MarksScoredForthisQuestion: number;
      }>;
      // Accept possible backend-required fields as passthrough too
      UserName?: string;
      UserImage?: string;
    },
    showGlobalLoader: boolean = true
  ): Promise<any | null> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/BuyerTest/GetTestViewModel/${skip}/${encodeURIComponent(testId)}/${encodeURIComponent(userId)}`;
    try {
      // Derive defaults for UserName and UserImage from token claims
      let defaults: Record<string, unknown> = {};
      const token = localStorage.getItem('AuthToken') || '';
      const claims = parseJwt(token);
      const profile = normalizeClaims(claims);
      if (profile) {
        defaults = {
          UserName: body?.UserName ?? profile.name ?? '',
          UserImage: body?.UserImage ?? profile.image ?? '',
        };
      }
      const requestBody = { ...defaults, ...(body ?? {}) };
      const data = await api.post(endpoint, requestBody, { showGlobalLoader });
      if (!data) return null;
      // Normalize common API wrapping
      return (data as any)?.data ?? data;
    } catch (error) {
      console.error('Failed to fetch test view model:', { testId, userId, skip, error });
      return null;
    }
  };

  // Check if a test is subscribed for a given user
  // GET: /api/BuyerTest/IsTestSubscribed/{testId}/{userId}
  const isTestSubscribed = async (
    testId: string,
    userId: string,
    showGlobalLoader: boolean = true
  ): Promise<boolean> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/BuyerTest/IsTestSubscribed/${encodeURIComponent(testId)}/${encodeURIComponent(userId)}`;
    try {
      const data = await api.get(endpoint, { showGlobalLoader });
      const payload = (data as any)?.data ?? data;
      if (typeof payload === 'string') return /^true$/i.test(payload);
      if (typeof payload === 'boolean') return payload;
      if (typeof payload === 'number') return payload !== 0;
      return false;
    } catch (error) {
      console.error('Failed to check IsTestSubscribed:', { testId, userId, error });
      return false;
    }
  };

  // GET: TestReviews/GetUserTestReview/{userId}/{examId}
  const getUserTestReview = async (userId: string, examId: string): Promise<any | null> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/TestReviews/GetUserTestReview/${encodeURIComponent(userId)}/${encodeURIComponent(examId)}`;
    try {
      const data = await api.get(endpoint, true);
      return (data as any)?.data ?? data ?? null;
    } catch (error) {
      console.error('Failed to fetch user test review:', { userId, examId, error });
      return null;
    }
  };

  // PUT: BuyerTest/GetCurrentExamQuestion/{isExamOver}/{isUpdate} with body: TestViewModel
  const getCurrentExamQuestion = async (
    isExamOver: boolean,
    isUpdate: boolean,
    viewModel: Record<string, unknown>,
    showGlobalLoader: boolean = true
  ): Promise<any | null> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/BuyerTest/GetCurrentExamQuestion/${isExamOver}/${isUpdate}`;
    try {
      // Ensure expected identity fields are present in body
      let enriched: Record<string, unknown> = { ...viewModel };
      const token = localStorage.getItem('AuthToken') || '';
      const claims = parseJwt(token);
      const profile = normalizeClaims(claims);
      if (profile) {
        if (enriched.UserName === undefined) enriched.UserName = profile.name ?? '';
        if (enriched.UserImage === undefined) enriched.UserImage = profile.image ?? '';
      }
      const data = await api.put(endpoint, enriched, { showGlobalLoader });
      return (data as any)?.data ?? data ?? null;
    } catch (error) {
      console.error('Failed to persist current exam question:', { isExamOver, isUpdate, error });
      return null;
    }
  };

  // GET: BuyerTest/GetVidoesLinkForQues/{PKTestQuestionId}
  const getVideosLinkForQuestion = async (
    questionId: string
  ): Promise<string[] | null> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/BuyerTest/GetVidoesLinkForQues/${encodeURIComponent(questionId)}`;
    try {
      const data = await api.get(endpoint, true);
      const payload = (data as any)?.data ?? data;
      if (Array.isArray(payload)) return payload as string[];
      return null;
    } catch (error) {
      console.error('Failed to fetch videos link for question:', { questionId, error });
      return null;
    }
  };

  // POST: TestBuyerSubscription/ActivateTestBuyerSubscription/{userId}/{testSuiteId}/{testId}
  const activateTestBuyerSubscription = async (
    userId: string,
    testSuiteId: string,
    testId: string
  ): Promise<boolean> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/TestBuyerSubscription/ActivateTestBuyerSubscription/${encodeURIComponent(userId)}/${encodeURIComponent(testSuiteId)}/${encodeURIComponent(testId)}`;
    try {
      const data = await api.post(endpoint, {}, true);
      const payload = (data as any)?.data ?? data;
      if (typeof payload === 'string') return /^true$/i.test(payload);
      if (typeof payload === 'boolean') return payload;
      if (typeof payload === 'number') return payload !== 0;
      return false;
    } catch (error) {
      console.error('Failed to activate test buyer subscription:', { userId, testSuiteId, testId, error });
      return false;
    }
  };

  // Get Buyer Test By ID - fetches complete exam results after finishing
  // GET: /api/BuyerTest/GetBuyerTestById/{buyerTestId}
  const getBuyerTestById = async (buyerTestId: string, showGlobalLoader: boolean = true): Promise<any | null> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/BuyerTest/GetBuyerTestById/${buyerTestId}`;
    try {
      const data = await api.get(endpoint, showGlobalLoader);
      return (data as any)?.data ?? data ?? null;
    } catch (error) {
      console.error('Failed to fetch buyer test by ID:', { buyerTestId, error });
      return null;
    }
  };

  return {
    getTestsByUserId,
    getTestViewModel,
    isTestSubscribed,
    getUserTestReview,
    getCurrentExamQuestion,
    getVideosLinkForQuestion,
    activateTestBuyerSubscription,
    getBuyerTestById,
  };
};
