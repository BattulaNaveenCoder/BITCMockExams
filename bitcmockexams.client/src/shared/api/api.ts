import { useAxiosInstance } from '@config/axios';

export const useApiService = () => {
  const axios = useAxiosInstance();
  type RequestOptions = boolean | { showGlobalLoader?: boolean; skipAuth?: boolean; headers?: Record<string, string>; timeout?: number };

  const buildConfig = (opts?: RequestOptions) => {
    if (typeof opts === 'boolean' || typeof opts === 'undefined') {
      return { showGlobalLoader: opts as any } as any;
    }
    const { showGlobalLoader, skipAuth, headers, timeout } = opts || {};
    const cfg: any = {};
    if (typeof showGlobalLoader !== 'undefined') cfg.showGlobalLoader = showGlobalLoader;
    if (typeof skipAuth !== 'undefined') cfg.skipAuth = skipAuth;
    if (headers) cfg.headers = headers;
    if (timeout) cfg.timeout = timeout;
    return cfg;
  };

  const handleError = (error: any) => {
    if (error?.response) {
      switch (error.response.status) {
        case 400:
          return error.response;
        case 401:
          console.error('Unauthorized access');
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        default:
          console.error('Server error:', error.response.status);
      }
    } else if (error?.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error?.message);
    }
  };

  return {
    get: async (endpoint: string, options: RequestOptions = true) => {
      try {
        const response = await axios.get(endpoint, buildConfig(options));
        return response.data;
      } catch (error) {
        const handledError = handleError(error);
        if (handledError && handledError.status === 400) {
          return handledError.data;
        }
        throw error;
      }
    },
    post: async (endpoint: string, data: any, options: RequestOptions = true) => {
      try {
        const response = await axios.post(endpoint, data, buildConfig(options));
        return response.data;
      } catch (error) {
        const handledError = handleError(error);
        if (handledError && handledError.status === 400) {
          return handledError.data;
        }
        throw error;
      }
    },
    put: async (endpoint: string, data: any, options: RequestOptions = true) => {
      try {
        const response = await axios.put(endpoint, data, buildConfig(options));
        return response.data;
      } catch (error) {
        const handledError = handleError(error);
        if (handledError && handledError.status === 400) {
          return handledError.data;
        }
        throw error;
      }
    },
    delete: async (endpoint: string, data: any = null, options: RequestOptions = true) => {
      try {
        const config: any = buildConfig(options);
        if (data) {
          config.data = data;
        }
        const response = await axios.delete(endpoint, config);
        return response.data;
      } catch (error) {
        const handledError = handleError(error);
        if (handledError && handledError.status === 400) {
          return handledError.data;
        }
        throw error;
      }
    },
    patch: async (endpoint: string, data: any, options: RequestOptions = true) => {
      try {
        const response = await axios.patch(endpoint, data, buildConfig(options));
        return response.data;
      } catch (error) {
        const handledError = handleError(error);
        if (handledError && handledError.status === 400) {
          return handledError.data;
        }
        throw error;
      }
    }
  };
};
