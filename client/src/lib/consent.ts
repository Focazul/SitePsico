export const COOKIE_CONSENT_KEY = 'cookie_consent';
export const COOKIE_CONSENT_EVENT = 'cookie-consent-changed';

export type CookieConsentStatus = 'accepted' | 'rejected';

export function getCookieConsentStatus(): CookieConsentStatus | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return value === 'accepted' || value === 'rejected' ? value : null;
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsentStatus() === 'accepted';
}

export function setCookieConsentStatus(status: CookieConsentStatus) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COOKIE_CONSENT_KEY, status);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: status }));
}
