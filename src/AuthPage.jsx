import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [view, setView] = useState('auth'); // 'auth' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  // reset password state
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setResetToken(data.resetToken);
    } catch {
      setError('Network error. Please try again.');
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
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setResetSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const goBack = () => {
    setView('auth');
    setError('');
    setForgotEmail('');
    setResetToken('');
    setCopied(false);
    setTokenInput('');
    setNewPassword('');
    setResetSuccess(false);
  };

  // --- Forgot password view ---
  if (view === 'forgot') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>Enter your email to get a reset token</CardDescription>
          </CardHeader>
          <CardContent>
            {!resetToken ? (
              <form onSubmit={handleForgot} className="flex flex-col gap-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full">Get reset token</Button>
                <button type="button" className="text-sm text-center text-muted-foreground underline" onClick={goBack}>
                  Back to sign in
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">Copy your reset token below. It expires in <span className="font-medium text-foreground">15 minutes</span>.</p>
                <div className="flex gap-2">
                  <Input value={resetToken} readOnly className="font-mono text-xs" />
                  <Button variant="outline" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</Button>
                </div>
                <Button className="w-full" onClick={() => { setView('reset'); setTokenInput(resetToken); setError(''); }}>
                  Continue to reset password
                </Button>
                <button type="button" className="text-sm text-center text-muted-foreground underline" onClick={goBack}>
                  Back to sign in
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Reset password view ---
  if (view === 'reset') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>Enter your token and choose a new password</CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-green-600 font-medium">Password reset successfully!</p>
                <Button className="w-full" onClick={goBack}>Sign in</Button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="Reset token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="font-mono text-xs"
                  required
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full">Reset password</Button>
                <button type="button" className="text-sm text-center text-muted-foreground underline" onClick={goBack}>
                  Back to sign in
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Login / Register view ---
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isLogin ? 'Sign in' : 'Create account'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Enter your credentials to access your account' : 'Sign up to start tracking your finances'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
            {isLogin && (
              <button
                type="button"
                className="text-sm text-center text-muted-foreground underline"
                onClick={() => { setView('forgot'); setError(''); }}
              >
                Forgot password?
              </button>
            )}
            <p className="text-sm text-center text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                className="underline text-foreground"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthPage;
