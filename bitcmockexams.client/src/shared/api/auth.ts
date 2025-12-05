import { useApiService } from '@api/api';

type LoginRequest = Record<string, unknown>;

const BASE_URL = 'https://www.bestitcourses.com/api';

export const useAuthApi = () => {
  const api = useApiService();
   
  const login = (payload: LoginRequest, showGlobalLoader: boolean = true) => {
    const url = `${BASE_URL}/AuthAPI/Login`;
    return api.post(url, payload, showGlobalLoader);
  };

  return { login };
};
