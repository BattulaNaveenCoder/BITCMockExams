import { useEffect } from 'react';
import { ensureRecaptchaLoaded } from '@shared/utils/recaptchaV3';

// Loads reCAPTCHA v3 script on app start so the badge is visible site-wide.
// No UI is rendered; v3 is invisible aside from the badge.
export default function RecaptchaV3Badge() {
  useEffect(() => {
    ensureRecaptchaLoaded().catch((err) => {
      // Swallow errors to avoid breaking the app; optional: log
      console.error('reCAPTCHA v3 load failed:', err);
    });
  }, []);
  return null;
}
