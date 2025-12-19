import { useApiService } from '@api/api';

type LoginRequest = Record<string, unknown>;

// Use relative base path so Vite dev proxy can handle CORS in development
const BASE_URL = 'api';

export const useAuthApi = () => {
  const api = useApiService();
   
  const login = (payload: LoginRequest, showGlobalLoader: boolean = true) => {
    const base = process.env.NODE_ENV === 'development' ? `${window.location.origin}/a2z-identity` : 'https://a2z-identity.azurewebsites.net';
    const url = `${base}/api/AuthAPI/Login`;
    //const url = `https://a2z-identity.azurewebsites.net/api/AuthAPI/Login`;

    const rawUser = (payload as any)?.userName
      ?? (payload as any)?.UserName
      ?? (payload as any)?.username
      ?? (payload as any)?.email
      ?? (payload as any)?.Email
      ?? '';
    const rawPass = (payload as any)?.Password ?? (payload as any)?.password ?? '';
    const rawRemember = (payload as any)?.isrememberme ?? (payload as any)?.rememberMe ?? (payload as any)?.isRememberMe ?? false;
    const isrememberme = typeof rawRemember === 'string' ? /^true$/i.test(rawRemember) : !!rawRemember;
    const body = {
      userName: String(rawUser).trim(),
      Password: rawPass,
      isrememberme,
    } as Record<string, unknown>;
    return api.post(url, body, { showGlobalLoader, skipAuth: true });
  };

  // GET: /api/UserProfile/GetBDTuserCreditDetails/{email}/{pathId}
  // Returns boolean-like (true/false) indicating credit availability for the given TestSuite PathId
  const getUserCreditDetails = async (email: string, pathId: string): Promise<boolean> => {
    const base = process.env.NODE_ENV === 'development' ? `${window.location.origin}/a2z-identity` : 'https://a2z-identity.azurewebsites.net';
    const endpoint = `${base}/api/UserProfile/GetBDTuserCreditDetails/${encodeURIComponent(email)}/${encodeURIComponent(pathId)}`;
    try {
      const data = await api.get(endpoint, true);
      // Normalize to boolean: API may return string or primitive
      const payload = (data as any)?.data ?? data;
      if (typeof payload === 'string') return /^true$/i.test(payload);
      if (typeof payload === 'boolean') return payload;
      if (typeof payload === 'number') return payload !== 0;
      return false;
    } catch (error) {
      console.error('Failed to fetch user credit details:', { email, pathId, error });
      return false;
    }
  };

  const loginWithGoogle = (
    payload: { accessToken: string; provider?: 'Google' },
    showGlobalLoader: boolean = true
  ) => {
    const base = process.env.NODE_ENV === 'development' ? `${window.location.origin}/a2z-identity` : 'https://a2z-identity.azurewebsites.net';
    const url = `${base}/api/AuthAPI/SocialLogin`;
    // Ensure provider is sent as Google if not specified
    const body = { ...payload, provider: payload.provider ?? 'Google' } as Record<string, unknown>;
    return api.post(url, body, { showGlobalLoader, skipAuth: true });
  };

  // Check BDT User Subscription
  // GET: /api/UserProfile/GetBDTuserCreditDetails/{email}/{testTitle}
  // Returns boolean indicating if the user has BDT subscription for the given test
  const checkBDTSubscription = async (email: string, testTitle: string): Promise<boolean> => {
    if (!email || !testTitle) return false;
    
    const base = process.env.NODE_ENV === 'development' ? `${window.location.origin}/a2z-identity` : 'https://a2z-identity.azurewebsites.net';
    const endpoint = `${base}/api/UserProfile/GetBDTuserCreditDetails/${encodeURIComponent(email)}/${encodeURIComponent(testTitle)}`;
    
    try {
      const data = await api.get(endpoint, false); // Don't show loader for this check
      // Normalize to boolean: API may return string or primitive
      const payload = (data as any)?.data ?? data;
      if (typeof payload === 'string') return /^true$/i.test(payload);
      if (typeof payload === 'boolean') return payload;
      if (typeof payload === 'number') return payload !== 0;
      return false;
    } catch (error) {
      console.error('Failed to check BDT subscription:', { email, testTitle, error });
      return false;
    }
  };

  return { login, loginWithGoogle, getUserCreditDetails, checkBDTSubscription };
};
