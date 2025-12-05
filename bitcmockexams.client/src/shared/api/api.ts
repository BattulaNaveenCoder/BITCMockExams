import { useAxiosInstance } from '@config/axios';

export const useApiService = () => {
  const axios = useAxiosInstance();

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
    get: async (endpoint: string, showGlobalLoader: boolean = true) => {
      try {
        const response = await axios.get(endpoint, { showGlobalLoader } as any);
        return response.data;
      } catch (error) {
        const handledError = handleError(error);
        if (handledError && handledError.status === 400) {
          return handledError.data;
        }
        throw error;
      }
    },
    post: async (endpoint: string, data: any, showGlobalLoader: boolean = true) => {
      try {
        const response = await axios.post(endpoint, data, { showGlobalLoader } as any);
        return response.data;
      } catch (error) {
        const handledError = handleError(error);
        if (handledError && handledError.status === 400) {
          return handledError.data;
        }
        throw error;
      }
    },
    put: async (endpoint: string, data: any, showGlobalLoader: boolean = true) => {
      try {
        const response = await axios.put(endpoint, data, { showGlobalLoader } as any);
        return response.data;
      } catch (error) {
        const handledError = handleError(error);
        if (handledError && handledError.status === 400) {
          return handledError.data;
        }
        throw error;
      }
    },
    delete: async (endpoint: string, data: any = null, showGlobalLoader: boolean = true) => {
      try {
        const config: any = { showGlobalLoader };
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
    patch: async (endpoint: string, data: any, showGlobalLoader: boolean = true) => {
      try {
        const response = await axios.patch(endpoint, data, { showGlobalLoader } as any);
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
