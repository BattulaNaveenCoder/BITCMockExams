import { useApiService } from '@api/api';

type LoginRequest = Record<string, unknown>;

const BASE_URL = 'https://www.bestitcourses.com/api';

export const useAuthApi = () => {
  const api = useApiService();
   
  const login = (payload: LoginRequest, showGlobalLoader: boolean = true) => {
    const url = `${BASE_URL}/AuthAPI/Login`;
    return api.post(url, payload, showGlobalLoader);
  };

  const loginWithGoogle = (
    payload: { accessToken: string; provider?: 'Google' },
    showGlobalLoader: boolean = true
  ) => {
    // Endpoint provided by user for social login
    const url = `https://a2z-identity.azurewebsites.net/api/AuthAPI/SocialLogin`;
    // Ensure provider is sent as Google if not specified
    const body = { ...payload, provider: payload.provider ?? 'Google' } as Record<string, unknown>;
    return api.post(url, body, showGlobalLoader);
  };

  return { login, loginWithGoogle };
};
