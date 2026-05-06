'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './register.module.css';

type Mode = 'register' | 'login';

const MODE_CONFIG = {
  register: {
    bannerText: 'New Player',
    bannerIcon: '🌟',
    titleEmoji: '🎮',
    buttonText: 'Create Account',
    switchText: 'Already have an account?',
    switchAction: 'Log in here!',
  },
  login: {
    bannerText: 'Welcome Back',
    bannerIcon: '🚀',
    titleEmoji: '🏠',
    buttonText: 'Log In',
    switchText: "Don't have an account?",
    switchAction: 'Join the fun!',
  },
};

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialMode: Mode =
    searchParams.get('mode') === 'login' ? 'login' : 'register';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const config = MODE_CONFIG[mode];
  const endpoint =
    mode === 'register' ? '/api/auth/register' : '/api/auth/login';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !result?.ok) {
        setError(result?.error ?? 'Request failed.');
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === 'register' ? 'login' : 'register');
    setError(null);
  }

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        {/* Mode Indicator Banner */}
        <div className={`${styles.modeBanner} ${styles[mode]}`}>
          <span className={styles.modeIcon}>{config.bannerIcon}</span>
          <span>{config.bannerText}</span>
        </div>

        {/* Title with Emoji */}
        <h1 className={styles.title}>
          <span className={styles.titleEmoji}>{config.titleEmoji}</span>
          Thai English Playland
        </h1>
        <p className={styles.subtitle}>
          {mode === 'register'
            ? 'Create your account and start the adventure!'
            : 'Ready to continue your journey?'}
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          {/* Username Field */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">
              <span className={styles.labelEmoji}>👤</span>
              Username
            </label>
            <input
              id="username"
              className={styles.input}
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Password Field */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              <span className={styles.labelEmoji}>🔐</span>
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                mode === 'register'
                  ? 'Create a password'
                  : 'Enter your password'
              }
              required
            />
          </div>

          {/* Error Message */}
          {error ? (
            <p className={styles.error}>
              <span>⚠️</span>
              {error}
            </p>
          ) : null}

          {/* Submit Button */}
          <button
            className={`${styles.submit} ${styles[mode]}`}
            type="submit"
            disabled={loading}
          >
            {loading ? '⏳ Please wait...' : `🚀 ${config.buttonText}`}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* Mode Switch Button */}
        <button
          className={styles.switchMode}
          type="button"
          onClick={toggleMode}
        >
          {config.switchText} <strong>{config.switchAction}</strong>
        </button>
      </section>
    </main>
  );
}
