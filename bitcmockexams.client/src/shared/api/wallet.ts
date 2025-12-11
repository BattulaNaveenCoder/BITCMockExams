import { useApiService } from '@shared/api/api';
import { parseJwt, normalizeClaims } from '@shared/utils/auth';

const isDev = process.env.NODE_ENV === 'development';

export const useWalletApi = () => {
  const api = useApiService();

  // GET: /api/Wallet/GetBalance/{userId}
  const getWalletBalance = async (userId?: string): Promise<number> => {
    // Follow project flow: derive userId from JWT if not provided
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const token = localStorage.getItem('AuthToken') || '';
      const claims = parseJwt(token);
      const profile = normalizeClaims(claims);
      effectiveUserId = profile.userId || '';
    }
    if (!effectiveUserId) {
      console.error('Wallet balance request missing userId');
      return 0;
    }
    const base = isDev ? `${window.location.origin}/subscriptionapi` : 'https://subscriptionapi.azurewebsites.net';
    const endpoint = `${base}/api/Wallet/GetBalance/${encodeURIComponent(effectiveUserId)}`;
    try {
      const data = await api.get(endpoint, true);
      const payload = (data as any)?.data ?? data;
      if (typeof payload === 'number') return payload;
      if (typeof payload === 'string') {
        const n = Number(payload);
        return Number.isFinite(n) ? n : 0;
      }
      return 0;
    } catch (error) {
      console.error('Failed to fetch wallet balance:', { userId: effectiveUserId, error });
      return 0;
    }
  };

  return { getWalletBalance };
};
