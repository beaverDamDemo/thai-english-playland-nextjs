'use client';

type AnalyticsPayload = Record<string, unknown>;

export async function trackEvent(
  eventName: string,
  payload: AnalyticsPayload = {},
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      keepalive: true,
      body: JSON.stringify({
        eventName,
        payload,
        path: window.location.pathname,
        url: window.location.href,
      }),
    });
  } catch {
    // Intentionally silent: analytics failures should never break gameplay.
  }
}
