'use client';

import { useSyncExternalStore } from 'react';
import {
  getMusicEnabled,
  setMusicEnabled,
  subscribeMusic,
} from '../_lib/client/music';

export default function MusicToggle() {
  const isHydratedClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const enabled = useSyncExternalStore(
    subscribeMusic,
    getMusicEnabled,
    () => false,
  );

  if (!isHydratedClient) return null;

  const label = `Turn music ${enabled ? 'off' : 'on'}`;

  return (
    <button
      type="button"
      className="musicToggle"
      onClick={() => setMusicEnabled(!enabled)}
      aria-label={label}
      aria-pressed={enabled}
      title={label}
    >
      <span aria-hidden="true" className="musicToggleIcon">
        {enabled ? '🔊' : '🔇'}
      </span>
    </button>
  );
}
