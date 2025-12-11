import { useApiService } from '@shared/api/api';

const isDev = process.env.NODE_ENV === 'development';

export interface TestSuite {
  PKTestSuiteId: string;
  ImageTestsuiteUrl: string;
  TestSuiteTitle: string;
  IsActive: boolean;
  Status: number;
  FKContributorName: string;
  NumberofTests: number;
  totalCountQues: number;
  PathId: string;
  SerialNumber: string | null;
  Subscribed: boolean;
  Average: number;
  Total: number;
  TotalLearners: number;
  AttemptQsPercentage: number;
}

export const useTestSuitesApi = () => {
  const api = useApiService();

  const getAllTestSuitesByUserId = async (userId: string): Promise<TestSuite[]> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/TestSuite/GetAllTestSuites/User/${encodeURIComponent(userId)}`;
    try {
      const data = await api.get(endpoint, false);
      if (!data) return [];
      if (Array.isArray(data)) return data as TestSuite[];
      if (Array.isArray((data as any)?.data)) return (data as any).data as TestSuite[];
      return [];
    } catch (error) {
      console.error('Failed to fetch test suites:', error);
      return [];
    }
  };

  // Global search endpoint: /api/TestSuite/GlobalSearch/{skip}/{take}/{term}
  const globalSearch = async (term: string, skip = 0, take = 10): Promise<TestSuite[]> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    const endpoint = `${base}/api/TestSuite/GlobalSearch/${skip}/${take}/${encodeURIComponent(term)}`;
    try {
      const data = await api.get(endpoint, false);
      if (!data) return [];
      if (Array.isArray(data)) return data as TestSuite[];
      if (Array.isArray((data as any)?.data)) return (data as any).data as TestSuite[];
      return [];
    } catch (error) {
      console.error('Failed global search:', error);
      return [];
    }
  };

  // Detailed Test Suite types aligned to backend response
  interface TestDetailDTO {
    PKTestId: string;
    Title: string;
    SubTitle: string;
    SerialNumber: number;
    DurationinMinutes: number;
    ActivationDateTime: string | null;
    DeActivationDateTime: string | null;
    DefaultTimeinMinutesForEachQuestion: number;
    IsActive: boolean;
    NumberOfQuestions: number;
    MaximumMarks: number;
    Status: number;
    TestType: number;
    PathId: string;
  }

  interface TestSuiteDetailsResponse {
    PKTestSuiteId: string;
    ImageTestsuiteUrl: string;
    TestSuiteTitle: string;
    TestSuiteSubTitle: string;
    TotalPriceInRupees: number;
    TotalPriceInDollars: number;
    IsActive: boolean;
    Status: number;
    FKContributorName: string;
    NumberofTests: number;
    PathId: string;
    SerialNumber: string | null;
    Subscribed: boolean;
    Title_SEO: string | null;
    Description_SEO: string | null;
    Keywords_SEO: string | null;
    Heading_SEO: string | null;
    IsRegularType: boolean;
    TestsDetailsDTO: TestDetailDTO[];
  }

  // Fetch a single Test Suite by PathId with its Test details for a User
  const getTestSuiteByPathId = async (
    pathId: string,
    userId: string
  ): Promise<TestSuiteDetailsResponse | null> => {
    const base = isDev ? `${window.location.origin}/a2z-tests` : 'https://a2z-tests.azurewebsites.net';
    // Backend URL shape: /api/TestSuite/GetTestSuiteByPathId/{PathId}/{UserId}/User
    const endpoint = `${base}/api/TestSuite/GetTestSuiteByPathId/${encodeURIComponent(pathId)}/${encodeURIComponent(userId)}/User`;
    try {
      const data = await api.get(endpoint, false);
      // Attempt to normalize typical API shapes
      const payload = (data && (data as any).data) ? (data as any).data : data;
      if (!payload) return null;
      return payload as TestSuiteDetailsResponse;
    } catch (error) {
      console.error('Failed to fetch test suite by PathId:', { pathId, userId, error });
      return null;
    }
  };

  return { getAllTestSuitesByUserId, getTestSuiteByPathId, globalSearch };
};
