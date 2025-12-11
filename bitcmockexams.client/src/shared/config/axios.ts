import axios from 'axios';
import { useLoader } from '@shared/contexts/LoadingContext';

const createAxiosInstance = (showLoader: () => void, hideLoader: () => void) => {
  const instance = axios.create({
    baseURL: 'https://a2z-identity.azurewebsites.net/',
    timeout: 100000,
  });

  instance.interceptors.request.use(
    (config) => {
      if ((config as any).showGlobalLoader !== false) {
        showLoader();
      }
      const skipAuth = (config as any).skipAuth === true || ((config.headers as any)?.['X-Skip-Auth'] === 'true');
      if (!skipAuth) {
        const token = localStorage.getItem('AuthToken');
        if (token) {
          config.headers = config.headers ?? {};
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      }
      if (!(config.headers as any)?.['Content-Type']) {
        if (config.data instanceof FormData) {
          delete (config.headers as any)?.['Content-Type'];
        } else {
          (config.headers as any)['Content-Type'] = 'application/json';
        }
      }
      return config;
    },
    (error) => {
      hideLoader();
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      if ((response.config as any).showGlobalLoader !== false) {
        hideLoader();
      }
      return response;
    },
    (error) => {
      if (error?.config && (error.config as any).showGlobalLoader !== false) {
        hideLoader();
      }
      if (error?.response && error.response.status === 400) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const useAxiosInstance = () => {
  const { showLoader, hideLoader } = useLoader();
  return createAxiosInstance(showLoader, hideLoader);
};
