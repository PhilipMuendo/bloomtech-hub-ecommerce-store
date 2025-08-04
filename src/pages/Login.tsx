import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PasswordInput from '@/components/PasswordInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-blue-100 mb-8">
              Sign in to your account to access our premium electrical and ICT solutions
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-blue-100">Premium Quality Products</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-blue-100">Expert Technical Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-blue-100">Fast & Secure Delivery</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Welcome back! Please enter your details</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-invalid={!!fieldErrors.email}
                      className={`pl-10 h-12 border-2 transition-all duration-200 ${
                        fieldErrors.email 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-invalid={!!fieldErrors.password}
                      className={`pl-10 h-12 border-2 transition-all duration-200 ${
                        fieldErrors.password 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Enter your password"
                    />
                  </div>
                  {fieldErrors.password && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{fieldErrors.password}</span>
                    </div>
                  )}
                  <div className="text-right mt-2">
                    <button 
                      type="button" 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200" 
                      onClick={() => setShowForgot(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {inlineError && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 text-sm">{inlineError}</span>
                  </div>
                )}

                {unverifiedEmail && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-800 font-medium">Email Verification Required</span>
                    </div>
                    <p className="text-yellow-700 text-sm mb-3">
                      Please verify your email address before logging in.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleResend}
                      className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      Resend Verification Email
                    </Button>
                    {resendSuccess && (
                      <div className="flex items-center space-x-2 mt-3 p-2 bg-green-50 border border-green-200 rounded">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 text-sm">{resendSuccess}</span>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <GoogleLoginButton />
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Reset Your Password</DialogTitle>
          </DialogHeader>
          {forgotSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-700 font-semibold text-lg">{forgotSuccess}</p>
            </div>
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
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                {forgotError && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{forgotError}</span>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                Send Reset Email
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;