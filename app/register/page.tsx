'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './register.module.css';

type Mode = 'register' | 'login';

type Bilingual = { en: string; th: string };

// Hardcoded Thai translations: no online translation service is used on this page.
const MODE_CONFIG: Record<
  Mode,
  {
    tab: Bilingual;
    tabIcon: string;
    heading: Bilingual;
    buttonText: Bilingual;
    passwordPlaceholder: string;
  }
> = {
  register: {
    tab: { en: 'Sign up', th: 'สมัครสมาชิก' },
    tabIcon: '🌟',
    heading: {
      en: 'Create your account and start the adventure!',
      th: 'สร้างบัญชีของคุณและเริ่มการผจญภัย!',
    },
    buttonText: { en: 'Create account', th: 'สร้างบัญชี' },
    passwordPlaceholder: 'Create a password',
  },
  login: {
    tab: { en: 'Log in', th: 'เข้าสู่ระบบ' },
    tabIcon: '🚀',
    heading: {
      en: 'Welcome back! Ready to keep playing?',
      th: 'ยินดีต้อนรับกลับ! พร้อมเล่นต่อหรือยัง?',
    },
    buttonText: { en: 'Log in', th: 'เข้าสู่ระบบ' },
    passwordPlaceholder: 'Your password',
  },
};

const TEXT = {
  title: { en: 'Thai English Playland', th: 'ไทยอิงลิชเพลย์แลนด์' },
  username: { en: 'Username', th: 'ชื่อผู้ใช้' },
  password: { en: 'Password', th: 'รหัสผ่าน' },
  passwordHint: { en: 'At least 8 characters', th: 'อย่างน้อย 8 ตัวอักษร' },
  showPassword: { en: 'Show password', th: 'แสดงรหัสผ่าน' },
  hidePassword: { en: 'Hide password', th: 'ซ่อนรหัสผ่าน' },
  wait: { en: 'Please wait…', th: 'กรุณารอสักครู่…' },
};

const ZONE_BUBBLES = ['🌱', '🐘', '🎰', '🏝️', '🌊'];

const ERROR_TRANSLATIONS: Record<string, string> = {
  'Request failed.': 'คำขอล้มเหลว',
  'Network error, please try again.': 'เครือข่ายขัดข้อง กรุณาลองอีกครั้ง',
  'Missing username or password.': 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
  'Invalid username or password.': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  'Username must be 3-30 chars (letters, numbers, _ or -).':
    'ชื่อผู้ใช้ต้องมี 3-30 ตัวอักษร (ตัวอักษร ตัวเลข _ หรือ -)',
  'Password must be at least 8 characters.':
    'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
  'Username already exists.': 'ชื่อผู้ใช้นี้ถูกใช้แล้ว',
  'Registration failed.': 'การสมัครสมาชิกล้มเหลว',
};

function pair(text: Bilingual): string {
  return `${text.en} / ${text.th}`;
}

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const initialMode: Mode =
    searchParams.get('mode') === 'login' ? 'login' : 'register';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setError(null);
  }

  return (
    <main className={styles.container} data-mode={mode}>
      <div className={styles.inner}>
        <header className={styles.logo}>
          <div className={styles.bubbles} aria-hidden="true">
            {ZONE_BUBBLES.map((emoji, index) => (
              <span key={emoji} className={styles.bubble} style={{ animationDelay: `${index * 0.18}s` }}>
                {emoji}
              </span>
            ))}
          </div>
          <h1 className={styles.title}>
            {TEXT.title.en}
            <span className={styles.titleThai} lang="th">
              {TEXT.title.th}
            </span>
          </h1>
        </header>

        <section className={styles.card} aria-labelledby="auth-heading">
          <div className={styles.tabs} role="tablist" aria-label={pair({ en: 'Sign up or log in', th: 'สมัครหรือเข้าสู่ระบบ' })}>
            {(['register', 'login'] as const).map((tabMode) => (
              <button
                key={tabMode}
                type="button"
                role="tab"
                aria-selected={mode === tabMode}
                className={`${styles.tab} ${mode === tabMode ? styles.tabActive : ''}`}
                data-tab={tabMode}
                onClick={() => switchMode(tabMode)}
              >
                <span aria-hidden="true">{MODE_CONFIG[tabMode].tabIcon}</span>
                <span className={styles.tabText}>
                  {MODE_CONFIG[tabMode].tab.en}
                  <span className={styles.tabThai} lang="th">
                    {MODE_CONFIG[tabMode].tab.th}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <p id="auth-heading" className={styles.heading}>
            {config.heading.en}
            <span className={styles.thai} lang="th">
              {config.heading.th}
            </span>
          </p>

          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">
                {TEXT.username.en}
                <span className={styles.labelThai} lang="th">
                  {TEXT.username.th}
                </span>
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon} aria-hidden="true">
                  👤
                </span>
                <input
                  id="username"
                  className={styles.input}
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                {TEXT.password.en}
                <span className={styles.labelThai} lang="th">
                  {TEXT.password.th}
                </span>
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon} aria-hidden="true">
                  🔐
                </span>
                <input
                  id="password"
                  className={`${styles.input} ${styles.inputWithToggle}`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    mode === 'register' ? 'new-password' : 'current-password'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={config.passwordPlaceholder}
                  aria-describedby={mode === 'register' ? 'password-hint' : undefined}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={pair(
                    showPassword ? TEXT.hidePassword : TEXT.showPassword,
                  )}
                  aria-pressed={showPassword}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {mode === 'register' ? (
                <p id="password-hint" className={styles.hint}>
                  {TEXT.passwordHint.en} ·{' '}
                  <span lang="th">{TEXT.passwordHint.th}</span>
                </p>
              ) : null}
            </div>

            {error ? (
              <p className={styles.error} role="alert">
                <span aria-hidden="true">🙈</span>
                <span className={styles.errorText}>
                  <span>{error}</span>
                  {ERROR_TRANSLATIONS[error] ? (
                    <span className={styles.thai} lang="th">
                      {ERROR_TRANSLATIONS[error]}
                    </span>
                  ) : null}
                </span>
              </p>
            ) : null}

            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? TEXT.wait.en : config.buttonText.en}
              <span className={styles.submitThai} lang="th">
                {loading ? TEXT.wait.th : config.buttonText.th}
              </span>
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}
