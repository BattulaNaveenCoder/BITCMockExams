import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useTestSuitesApi, type TestSuite } from '@shared/api/testSuites';
import { useAuth } from '@features/auth/context/AuthContext';
import { getUserIdFromClaims } from '@shared/utils/auth';

interface TestSuitesContextType {
  suites: TestSuite[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

const TestSuitesContext = createContext<TestSuitesContextType | undefined>(undefined);

// In-memory request cache to prevent duplicate API calls
const requestCache = new Map<string, Promise<TestSuite[]>>();
const dataCache = new Map<string, { data: TestSuite[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const TestSuitesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getAllTestSuitesByUserId } = useTestSuitesApi();
  const { user } = useAuth();
  const userId = useMemo(() => getUserIdFromClaims(user as any), [user]);

  const fetchTestSuites = useCallback(async (forceRefresh = false) => {
    const cacheKey = `testSuites_${userId || 'guest'}`;
    
    // Check data cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setSuites(cached.data);
        setLoading(false);
        return;
      }

      // Check sessionStorage
      try {
        const sessionCached = sessionStorage.getItem(cacheKey);
        if (sessionCached) {
          const { data, timestamp } = JSON.parse(sessionCached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setSuites(data);
            dataCache.set(cacheKey, { data, timestamp });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        sessionStorage.removeItem(cacheKey);
      }
    }

    // Check if request is already in progress
    const pendingRequest = requestCache.get(cacheKey);
    if (pendingRequest) {
      console.log('🔄 Reusing pending request for:', cacheKey);
      try {
        const data = await pendingRequest;
        setSuites(data);
        setLoading(false);
        return;
      } catch (err) {
        // Request failed, continue to make new request
      }
    }

    // Make new request
    console.log('🌐 Making API request for:', cacheKey);
    setLoading(true);
    setError(null);

    const requestPromise = getAllTestSuitesByUserId(userId || '')
      .then(data => {
        const result = data || [];
        
        // Update caches
        const now = Date.now();
        dataCache.set(cacheKey, { data: result, timestamp: now });
        
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ data: result, timestamp: now }));
        } catch (err) {
          console.warn('Failed to cache in sessionStorage:', err);
        }
        
        return result;
      })
      .finally(() => {
        requestCache.delete(cacheKey);
      });

    requestCache.set(cacheKey, requestPromise);

    try {
      const data = await requestPromise;
      setSuites(data);
    } catch (e: any) {
      console.error('Error loading test suites:', e);
      
      const isTimeout = e?.code === 'ECONNABORTED' || 
                       e?.message?.toLowerCase().includes('timeout') ||
                       e?.response?.data?.Message?.includes('Timeout');
      
      if (isTimeout) {
        setError('The server is taking longer than expected. Please try again or contact support if the issue persists.');
      } else {
        setError('Failed to load certification exams. Please try refreshing the page.');
      }
      setSuites([]);
    } finally {
      setLoading(false);
    }
  }, [userId, getAllTestSuitesByUserId]);

  const refetch = useCallback(async () => {
    await fetchTestSuites(true);
  }, [fetchTestSuites]);

  const clearCache = useCallback(() => {
    const cacheKey = `testSuites_${userId || 'guest'}`;
    dataCache.delete(cacheKey);
    requestCache.delete(cacheKey);
    sessionStorage.removeItem(cacheKey);
  }, [userId]);

  useEffect(() => {
    fetchTestSuites(false);
  }, [fetchTestSuites]);

  const value = useMemo(() => ({
    suites,
    loading,
    error,
    refetch,
    clearCache
  }), [suites, loading, error, refetch, clearCache]);

  return (
    <TestSuitesContext.Provider value={value}>
      {children}
    </TestSuitesContext.Provider>
  );
};

export const useTestSuites = (): TestSuitesContextType => {
  const context = useContext(TestSuitesContext);
  if (context === undefined) {
    throw new Error('useTestSuites must be used within a TestSuitesProvider');
  }
  return context;
};
