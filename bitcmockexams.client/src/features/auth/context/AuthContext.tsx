import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  login: (token: string, returnUrl?: string, userName?: string) => void;
  logout: () => void;
  user: JWTPayload | null;
  token: string | null;
  isAuthenticated: boolean | null;
  displayName: string | null;
}

interface JWTPayload extends JwtPayload {
  exp: number;
  nbf: number;
  email?: string;
  isReadOnly?: string;
  ISEmailVerified?: boolean | string;
}

interface TokenValidationResult {
  isValid: boolean;
  reason: string;
  expiresIn?: number;
  validIn?: number;
  expiresInMinutes?: number;
  expiresInHours?: number;
  error?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const AUTHTOKEN = 'AuthToken';
  const navigate = useNavigate();
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setAuthentication] = useState<boolean | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTHTOKEN);
    if (token && token !== 'null' && token !== 'undefined') {
      const decodedToken = jwtDecode<JWTPayload>(token);
      if (isTokenValid(decodedToken).isValid) {
        setToken(token);
        setAuthentication(true);
        setUser(decodedToken);
        setDisplayName(null);
      } else {
        logout();
        navigate('/', { replace: true });
      }
    } else {
      setAuthentication(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentUTCTimestamp = () => Math.floor(new Date().getTime() / 1000);

  const isTokenValid = (payload: JWTPayload): TokenValidationResult => {
    const currentTimestamp = getCurrentUTCTimestamp();
    try {
      const expirationTime = payload.exp;
      const notBeforeTime = payload.nbf;
      if (currentTimestamp > expirationTime) {
        return { isValid: false, reason: 'Token has expired', expiresIn: 0 };
      }
      if (currentTimestamp < notBeforeTime) {
        return { isValid: false, reason: 'Token is not yet valid', validIn: notBeforeTime - currentTimestamp };
      }
      const timeRemaining = expirationTime - currentTimestamp;
      return {
        isValid: true,
        reason: 'Token is valid',
        expiresIn: timeRemaining,
        expiresInMinutes: Math.floor(timeRemaining / 60),
        expiresInHours: Math.floor(timeRemaining / 3600),
      };
    } catch (error: any) {
      return { isValid: false, reason: 'Error validating token', error: error?.message ?? 'Unknown error' };
    }
  };

  const login = (token: string, returnUrl?: string, userName?: string) => {
    sessionStorage.removeItem('cleanLogout');
    setToken(token);
    setAuthentication(true);
    localStorage.setItem(AUTHTOKEN, token);
    const decodedToken = jwtDecode<JWTPayload>(token);
    setUser(decodedToken);
    if (userName && typeof userName === 'string') {
      setDisplayName(userName);
    } else {
      setDisplayName(null);
    }
    if (returnUrl) {
      const isValidReturnUrl = returnUrl.startsWith('/') && !returnUrl.startsWith('//');
      if (isValidReturnUrl) {
        navigate(returnUrl, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthentication(false);
    setDisplayName(null);
    localStorage.removeItem(AUTHTOKEN);
    sessionStorage.setItem('cleanLogout', 'true');
  };

  return (
    <AuthContext.Provider value={{ login, logout, user, token, isAuthenticated, displayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
