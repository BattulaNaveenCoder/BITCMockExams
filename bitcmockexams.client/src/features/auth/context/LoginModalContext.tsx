import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface LoginModalContextType {
  isOpen: boolean;
  returnUrl?: string;
  open: (returnUrl?: string) => void;
  close: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | null>(null);

export const LoginModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | undefined>(undefined);

  const open = useCallback((url?: string) => {
    setReturnUrl(url);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(() => ({ isOpen, returnUrl, open, close }), [isOpen, returnUrl, open, close]);

  return <LoginModalContext.Provider value={value}>{children}</LoginModalContext.Provider>;
};

export const useLoginModal = () => {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error('useLoginModal must be used within LoginModalProvider');
  return ctx;
};
