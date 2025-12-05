import { useApiService } from '@shared/api/api';

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

  return { getTestsByUserId };
};
