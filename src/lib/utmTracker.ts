/**
 * UTM & Marketing Attribution Tracker
 * Extracted & modernized from enterprise real estate analytics architecture (One Green Way)
 * Automatically captures campaign parameters (UTM, gclid, fbclid) on arrival,
 * stores them for 30 days, and enriches every inquiry/lead submitted on Al Hisham Developments.
 */

export interface UtmParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  first_touch_timestamp?: number;
}

const STORAGE_KEY = 'al_hisham_utm_attribution';
const EXPIRY_DAYS = 30;

/**
 * Parse URL search query parameters
 */
function parseUrlParams(): UtmParameters {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(window.location.search);
  const params: UtmParameters = {};

  const keys: (keyof UtmParameters)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
  ];

  let hasAny = false;
  keys.forEach((key) => {
    const val = searchParams.get(key);
    if (val) {
      (params as any)[key] = val;
      hasAny = true;
    }
  });

  if (hasAny) {
    params.referrer = document.referrer || 'direct';
    params.first_touch_timestamp = Date.now();
  }

  return params;
}

/**
 * Initialize tracker: extracts current query params and persists them
 */
export function initUtmTracker(): UtmParameters {
  if (typeof window === 'undefined') return {};

  try {
    const currentParams = parseUrlParams();

    if (Object.keys(currentParams).length > 0) {
      const payload = {
        data: currentParams,
        expires: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return currentParams;
    }

    // Retrieve existing stored params
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expires && Date.now() < parsed.expires) {
        return parsed.data || {};
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (err) {
    console.warn('UtmTracker storage error:', err);
  }

  return {};
}

/**
 * Get active UTM parameters for lead attribution
 */
export function getStoredUtmParams(): UtmParameters {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expires && Date.now() < parsed.expires) {
        return parsed.data || {};
      }
    }
  } catch {
    // Ignore storage issues
  }
  return {};
}

/**
 * Format UTM parameters into a human-readable summary string for CRM messages
 */
export function formatUtmSummary(): string {
  const params = getStoredUtmParams();
  const parts: string[] = [];

  if (params.utm_source) parts.push(`Source: ${params.utm_source}`);
  if (params.utm_campaign) parts.push(`Campaign: ${params.utm_campaign}`);
  if (params.utm_medium) parts.push(`Medium: ${params.utm_medium}`);
  if (params.utm_content) parts.push(`Content: ${params.utm_content}`);
  if (params.gclid) parts.push(`Google Ads (GCLID): ${params.gclid}`);
  if (params.fbclid) parts.push(`Meta Ads (FBCLID): ${params.fbclid}`);

  return parts.length > 0 ? `\n\n[Marketing Attribution: ${parts.join(' | ')}]` : '';
}

/**
 * Safe DataLayer Event Dispatcher
 * Dispatches standard events without needing external GTM containers
 */
export function trackLeadEvent(eventName: string, eventData: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  const w = window as any;
  w.dataLayer = w.dataLayer || [];

  const utms = getStoredUtmParams();
  const payload = {
    event: eventName,
    timestamp: Date.now(),
    page_location: window.location.href,
    ...utms,
    ...eventData,
  };

  w.dataLayer.push(payload);

  // Dispatch custom window event for in-app reactive listeners
  try {
    window.dispatchEvent(new CustomEvent('al_hisham_analytics', { detail: payload }));
  } catch {
    // Ignore
  }
}
