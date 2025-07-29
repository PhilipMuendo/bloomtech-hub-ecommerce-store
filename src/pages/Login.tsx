import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PasswordInput from '@/components/PasswordInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Inline validation
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Invalid email address';
    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setInlineError('');
    setResendSuccess('');
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate('/');
    } catch (error: any) {
      if (error.message && error.message.toLowerCase().includes('verify your email')) {
        setUnverifiedEmail(email);
        setInlineError('Please verify your email before logging in.');
      } else {
        setInlineError('Login failed. ' + (error.message || ''));
      }
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    }
  };

  const handleResend = async () => {
    setResendSuccess('');
    setInlineError('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setResendSuccess('Verification email resent. Please check your inbox.');
      } else {
        setInlineError(data.error || 'Failed to resend verification email.');
      }
    } catch (err) {
      setInlineError('Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && <p className="text-destructive text-xs mt-1">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && <p className="text-destructive text-xs mt-1">{fieldErrors.password}</p>}
              <div className="text-right mt-1">
                <button type="button" className="text-primary underline text-xs" onClick={() => setShowForgot(true)}>
                  Forgot password?
                </button>
              </div>
            </div>
            {inlineError && <p className="text-destructive text-sm mt-2">{inlineError}</p>}
            {unverifiedEmail && (
              <div className="mt-2">
                <Button type="button" variant="outline" onClick={handleResend}>
                  Resend Verification Email
                </Button>
                {resendSuccess && <p className="text-green-600 text-sm mt-1">{resendSuccess}</p>}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Forgot Password Dialog */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
          </DialogHeader>
          {forgotSuccess ? (
            <div className="text-green-700 font-semibold text-center py-6">{forgotSuccess}</div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setForgotError('');
                setForgotSuccess('');
                try {
                  const res = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: forgotEmail })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setForgotSuccess('Password reset email sent! Please check your inbox.');
                  } else {
                    setForgotError(data.error || 'Failed to send reset email.');
                  }
                } catch (err) {
                  setForgotError('Failed to send reset email.');
                }
              }}
              className="space-y-4"
            >
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
              {forgotError && <p className="text-destructive text-xs mt-1">{forgotError}</p>}
              <Button type="submit" className="w-full">Send Reset Email</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;