type ActivityRecency = {
  label: string;
  level: 'recent' | 'week' | 'month' | 'older' | 'unknown';
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function getActivityRecency(lastActive: Date | null, now: number): ActivityRecency {
  if (!lastActive) return { label: 'Never', level: 'unknown' };

  const timestamp = lastActive.getTime();
  if (!Number.isFinite(timestamp)) return { label: 'Unknown', level: 'unknown' };
  if (timestamp > now) return { label: 'Future date', level: 'unknown' };

  const age = now - timestamp;
  if (age < DAY_MS) return { label: 'Within 24 hours', level: 'recent' };
  if (age < 7 * DAY_MS) return { label: 'Within 7 days', level: 'week' };
  if (age < 30 * DAY_MS) return { label: 'Within 30 days', level: 'month' };
  return { label: '30+ days ago', level: 'older' };
}
