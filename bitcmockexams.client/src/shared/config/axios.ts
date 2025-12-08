import axios from 'axios';
import { useLoader } from '@shared/contexts/LoadingContext';

const createAxiosInstance = (showLoader: () => void, hideLoader: () => void) => {
  const instance = axios.create({
    // No baseURL - we pass complete URLs from environment config
    timeout: 100000,
  });

  instance.interceptors.request.use(
    (config) => {
      if ((config as any).showGlobalLoader !== false) {
        showLoader();
      }
      const token = localStorage.getItem('AuthToken');
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
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
      // Handle 400 errors
      if (error?.response && error.response.status === 400) {
        return Promise.resolve(error.response);
      }
      // Handle 500 errors that might have response data (some APIs return data even with 500)
      if (error?.response && error.response.status === 500 && error.response.data) {
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
