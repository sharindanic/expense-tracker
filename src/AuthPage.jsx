import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';

// Server errors come back in English; map them to Japanese so the auth
// flow never mixes languages, even on failure.
const ERROR_JA = {
  'Email and password required': 'メールとパスワードを入力してください',
  'Email already in use': 'メールアドレスは既に使用されています',
  'Registration failed': '登録に失敗しました',
  'Invalid credentials': 'メールアドレスまたはパスワードが違います',
  'Login failed': 'ログインに失敗しました',
  'Email is required': 'メールを入力してください',
  'No account found with that email': 'このメールアドレスのアカウントが見つかりません',
  'Failed to generate reset token': 'トークンの生成に失敗しました',
  'Token and new password are required': 'トークンと新しいパスワードを入力してください',
  'Invalid reset token': 'トークンが無効です',
  'Reset token has expired': 'トークンの有効期限が切れています',
  'Failed to reset password': 'パスワードの更新に失敗しました',
};
const translateError = (msg) => ERROR_JA[msg] || 'エラーが発生しました';

// 侘寂 — an imperfect ensō (円相): a single brush circle, open on one side.
// Doubles as a coin / a sense of balance for the ledger.
function Enso() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="wabi-enso absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 text-[var(--sumi)]"
        viewBox="0 0 240 240"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="wabiInk" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="2" seed="8" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" />
          </filter>
        </defs>
        <path
          d="M 203 150 A 88 88 0 1 1 203 90"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.13"
          filter="url(#wabiInk)"
        />
      </svg>
    </div>
  );
}

// The signed scroll head: vertical 家計簿 (kakeibo — a kept household ledger)
// with a vermilion 記 (record) hanko seal beneath it.
function Mark() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="wabi-vertical text-4xl leading-none text-[var(--sumi)]">家計簿</div>
      <span className="wabi-seal" aria-hidden="true">記</span>
    </div>
  );
}

// Brush-underline field: an icon + a Japanese label, no boxes.
function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm text-[var(--sumi-soft)]">
        <Icon className="size-3.5" strokeWidth={1.5} />
        {label}
      </span>
      <Input className="wabi-input" aria-label={label} {...props} />
    </label>
  );
}

// A quiet ink text-link.
function Quiet({ children, ...props }) {
  return (
    <button
      type="button"
      className="text-sm text-[var(--sumi-soft)] underline-offset-4 transition-colors hover:text-[var(--sumi)]"
      {...props}
    >
      {children}
    </button>
  );
}

// Japanese-only button label, with the English word revealed on hover —
// keeps the UI Japanese-first while staying legible to non-readers.
function TranslatedButton({ en, className, ...props }) {
  return (
    <div className="group relative w-full">
      <Button className={className} {...props} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-full -translate-x-1/2 text-center text-[0.65rem] tracking-[0.2em] text-[var(--sumi-soft)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        {en}
      </span>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="wabi flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Enso />
      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-10">
        <Mark />
        {children}
      </div>
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [view, setView] = useState('auth'); // 'auth' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  // reset password state
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Live countdown for the 15-minute reset token, ticked off the actual
  // clock (not a naive decrement) so it stays correct across tab switches.
  useEffect(() => {
    if (!tokenExpiresAt) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((tokenExpiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tokenExpiresAt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error));
        return;
      }

      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch {
      setError('ネットワークエラー。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error));
        return;
      }
      setResetToken(data.resetToken);
      setTokenExpiresAt(Date.now() + 15 * 60 * 1000);
    } catch {
      setError('ネットワークエラー。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error));
        return;
      }
      setResetSuccess(true);
    } catch {
      setError('ネットワークエラー。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setView('auth');
    setError('');
    setForgotEmail('');
    setResetToken('');
    setTokenExpiresAt(null);
    setCopied(false);
    setTokenInput('');
    setNewPassword('');
    setResetSuccess(false);
  };

  const Err = () => error && <p className="text-sm text-[var(--shu)]">{error}</p>;

  // --- Forgot password view :: 再設定 ---
  if (view === 'forgot') {
    return (
      <Shell>
        {!resetToken ? (
          <form onSubmit={handleForgot} className="flex w-full flex-col gap-6">
            <Field
              icon={Mail}
              label="メール"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <Err />
            <TranslatedButton type="submit" className="wabi-btn" en="Get Token" disabled={loading}>
              {loading ? '・・・' : 'トークン'}
            </TranslatedButton>
            <div className="flex justify-center">
              <Quiet onClick={goBack}>
                <ArrowLeft className="mr-1 inline size-3.5" strokeWidth={1.5} />戻る
              </Quiet>
            </div>
          </form>
        ) : (
          <div className="flex w-full flex-col gap-5">
            <p className="text-center text-sm text-[var(--sumi-soft)]">
              有効期限{' '}
              <span className={secondsLeft <= 60 ? 'text-[var(--shu)]' : ''}>
                {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <Input value={resetToken} readOnly className="wabi-input font-mono text-xs" />
              <Button type="button" onClick={handleCopy} className="wabi-btn h-11 w-auto shrink-0 px-4 tracking-normal">
                {copied ? '済' : '複'}
              </Button>
            </div>
            <TranslatedButton
              className="wabi-btn"
              en="Next"
              onClick={() => { setView('reset'); setTokenInput(resetToken); setError(''); }}
            >
              次へ
            </TranslatedButton>
            <div className="flex justify-center">
              <Quiet onClick={goBack}>
                <ArrowLeft className="mr-1 inline size-3.5" strokeWidth={1.5} />戻る
              </Quiet>
            </div>
          </div>
        )}
      </Shell>
    );
  }

  // --- Reset password view :: 新しいパスワード ---
  if (view === 'reset') {
    return (
      <Shell>
        {resetSuccess ? (
          <div className="flex w-full flex-col gap-6">
            <p className="text-center text-base text-[var(--sumi)]">完了しました</p>
            <TranslatedButton className="wabi-btn" en="Login" onClick={goBack}>ログイン</TranslatedButton>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex w-full flex-col gap-6">
            <Field
              icon={KeyRound}
              label="トークン"
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="wabi-input font-mono text-xs"
              required
            />
            <Field
              icon={Lock}
              label="新しいパスワード"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Err />
            <TranslatedButton type="submit" className="wabi-btn" en="Update" disabled={loading}>
              {loading ? '・・・' : '更新'}
            </TranslatedButton>
            <div className="flex justify-center">
              <Quiet onClick={goBack}>
                <ArrowLeft className="mr-1 inline size-3.5" strokeWidth={1.5} />戻る
              </Quiet>
            </div>
          </form>
        )}
      </Shell>
    );
  }

  // --- Login / Register view :: ログイン / 新規登録 ---
  return (
    <Shell>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        <Field
          icon={Mail}
          label="メール"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          icon={Lock}
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Err />
        <TranslatedButton type="submit" className="wabi-btn" en={isLogin ? 'Login' : 'Register'} disabled={loading}>
          {loading ? '・・・' : isLogin ? 'ログイン' : '新規登録'}
        </TranslatedButton>

        <div className="flex flex-col items-center gap-3 pt-1">
          {isLogin && (
            <Quiet onClick={() => { setView('forgot'); setError(''); }}>
              パスワードをお忘れですか
            </Quiet>
          )}
          <div className="flex items-center gap-2 text-sm text-[var(--sumi-soft)]">
            <span className="h-px w-6 bg-[var(--sumi-line)]" />
            <Quiet onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? '新規登録' : 'ログイン'}
            </Quiet>
            <span className="h-px w-6 bg-[var(--sumi-line)]" />
          </div>
        </div>
      </form>
    </Shell>
  );
}

export default AuthPage;
