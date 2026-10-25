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
    bannerText: Bilingual;
    bannerIcon: string;
    titleEmoji: string;
    subtitle: Bilingual;
    buttonText: Bilingual;
    switchText: Bilingual;
    switchAction: Bilingual;
    passwordPlaceholder: Bilingual;
  }
> = {
  register: {
    bannerText: { en: 'New Player', th: 'ผู้เล่นใหม่' },
    bannerIcon: '🌟',
    titleEmoji: '🎮',
    subtitle: {
      en: 'Create your account and start the adventure!',
      th: 'สร้างบัญชีของคุณและเริ่มการผจญภัย!',
    },
    buttonText: { en: 'Create Account', th: 'สร้างบัญชี' },
    switchText: { en: 'Already have an account?', th: 'มีบัญชีอยู่แล้วใช่ไหม?' },
    switchAction: { en: 'Log in here!', th: 'เข้าสู่ระบบที่นี่!' },
    passwordPlaceholder: { en: 'Create a password', th: 'สร้างรหัสผ่าน' },
  },
  login: {
    bannerText: { en: 'Welcome Back', th: 'ยินดีต้อนรับกลับ' },
    bannerIcon: '🚀',
    titleEmoji: '🏠',
    subtitle: {
      en: 'Ready to continue your journey?',
      th: 'พร้อมที่จะเดินทางต่อหรือยัง?',
    },
    buttonText: { en: 'Log In', th: 'เข้าสู่ระบบ' },
    switchText: { en: "Don't have an account?", th: 'ยังไม่มีบัญชีใช่ไหม?' },
    switchAction: { en: 'Join the fun!', th: 'มาสนุกด้วยกัน!' },
    passwordPlaceholder: { en: 'Enter your password', th: 'ใส่รหัสผ่านของคุณ' },
  },
};

const TEXT = {
  title: { en: 'Thai English Playland', th: 'ไทยอิงลิชเพลย์แลนด์' },
  username: { en: 'Username', th: 'ชื่อผู้ใช้' },
  usernamePlaceholder: { en: 'Enter your name', th: 'ใส่ชื่อของคุณ' },
  password: { en: 'Password', th: 'รหัสผ่าน' },
  showPassword: { en: 'Show password', th: 'แสดงรหัสผ่าน' },
  hidePassword: { en: 'Hide password', th: 'ซ่อนรหัสผ่าน' },
  wait: { en: 'Please wait...', th: 'กรุณารอสักครู่...' },
  or: { en: 'or', th: 'หรือ' },
};

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

function Both({ text }: { text: Bilingual }) {
  return (
    <>
      <span>{text.en}</span>
      <span className={styles.thai} lang="th">
        {text.th}
      </span>
    </>
  );
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
          <span className={styles.stack}>
            <Both text={config.bannerText} />
          </span>
        </div>

        {/* Title with Emoji */}
        <h1 className={styles.title}>
          <span className={styles.titleEmoji}>{config.titleEmoji}</span>
          <Both text={TEXT.title} />
        </h1>
        <p className={`${styles.subtitle} ${styles.stack}`}>
          <Both text={config.subtitle} />
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          {/* Username Field */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="username">
              <span className={styles.labelEmoji}>👤</span>
              {pair(TEXT.username)}
            </label>
            <input
              id="username"
              className={styles.input}
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={pair(TEXT.usernamePlaceholder)}
              required
            />
          </div>

          {/* Password Field */}
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              <span className={styles.labelEmoji}>🔐</span>
              {pair(TEXT.password)}
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                autoComplete={
                  mode === 'register' ? 'new-password' : 'current-password'
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={pair(config.passwordPlaceholder)}
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
          </div>

          {/* Error Message */}
          {error ? (
            <p className={styles.error}>
              <span>⚠️</span>
              <span className={styles.stack}>
                <span>{error}</span>
                {ERROR_TRANSLATIONS[error] ? (
                  <span className={styles.thai} lang="th">
                    {ERROR_TRANSLATIONS[error]}
                  </span>
                ) : null}
              </span>
            </p>
          ) : null}

          {/* Submit Button */}
          <button
            className={`${styles.submit} ${styles[mode]}`}
            type="submit"
            disabled={loading}
          >
            <span className={styles.stack}>
              <Both text={loading ? TEXT.wait : config.buttonText} />
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>{pair(TEXT.or)}</span>
        </div>

        {/* Mode Switch Button */}
        <button
          className={styles.switchMode}
          type="button"
          onClick={toggleMode}
        >
          <span className={styles.stack}>
            <span>
              {config.switchText.en} <strong>{config.switchAction.en}</strong>
            </span>
            <span className={styles.thai} lang="th">
              {config.switchText.th} <strong>{config.switchAction.th}</strong>
            </span>
          </span>
        </button>
      </section>
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
