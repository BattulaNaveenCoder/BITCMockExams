// Lightweight reCAPTCHA v3 loader and executor
// Usage: const token = await getRecaptchaToken('contact_submit')

// Read the site key dynamically to avoid stale captures during HMR
const getSiteKey = (): string | undefined => (import.meta as any)?.env?.VITE_RECAPTCHA_SITE_KEY as string | undefined || '6LctKRgqAAAAAJ70a61-yUNBgWENnizixkIduKHX';

let scriptLoaded = false;
let loadingPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  loadingPromise = new Promise((resolve, reject) => {
    const key = getSiteKey();
    if (!key) {
      // Don't crash the app if site key is missing; just skip loading.
      console.warn('reCAPTCHA v3: VITE_RECAPTCHA_SITE_KEY is missing. Badge will not load.');
      resolve();
      return;
    }
    // If script is already present/loaded, resolve immediately
    const gre = (window as any).grecaptcha;
    if (gre && typeof gre.ready === 'function') {
      scriptLoaded = true;
      resolve();
      return;
    }

    const src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    const existing = document.querySelector('script[src*="https://www.google.com/recaptcha/api.js"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => {
        scriptLoaded = true;
        resolve();
      });
      existing.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA script')));
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => { scriptLoaded = true; resolve(); };
    s.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    document.head.appendChild(s);
  });
  return loadingPromise;
}

export function ensureRecaptchaLoaded(): Promise<void> {
  return loadScript();
}

export async function getRecaptchaToken(action: string): Promise<string> {
  const key = getSiteKey();
  if (!key) {
    throw new Error('Missing VITE_RECAPTCHA_SITE_KEY for reCAPTCHA v3');
  }
  await loadScript();
  // grecaptcha is attached to window by the script
  const grecaptcha: any = (window as any).grecaptcha;
  if (!grecaptcha || !grecaptcha.execute) {
    throw new Error('grecaptcha not available after script load');
  }
  await new Promise<void>((resolve) => grecaptcha.ready(() => resolve()));
  const token = await grecaptcha.execute(key, { action });
  if (!token) throw new Error('Failed to obtain reCAPTCHA token');
  return token;
}
