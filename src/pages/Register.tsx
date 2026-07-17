import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PasswordInput from '@/components/PasswordInput';
import GoogleLoginButton from '@/components/GoogleLoginButton';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Move useEffect outside conditional to fix hooks error
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Inline validation
    const errors: { name?: string; email?: string; phone?: string; password?: string } = {};
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Invalid email address';
    if (!phone) errors.phone = 'Phone number is required';
    else if (!/^(\+254|0)?[17]\d{8}$/.test(phone)) errors.phone = 'Please enter a valid Kenyan phone number (e.g., 254740505584, +254740505584, or 0740505584)';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const res = await register(name, email, password, phone);
      if (res && res.message) {
        setSuccessMessage(res.message);
        // If user is verified (development mode), redirect to login after 3 seconds
        if (res.user && res.user.verified) {
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else {
        setSuccessMessage('Registration successful. Please check your email to verify your account.');
      }
      // Do not navigate to home/login yet
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-lg border-2 border-primary/20 animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary mb-2">Registration Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#e0f2fe"/><path d="M7 13l3 3 7-7" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p className="mb-2 text-lg text-green-700 font-semibold">{successMessage}</p>
              {successMessage.includes('check your email') ? (
                <p className="text-muted-foreground text-sm mb-4">Didn't receive the email? Check your spam folder or <a href="/resend-verification" className="text-primary underline">resend verification</a>.</p>
              ) : (
                <p className="text-muted-foreground text-sm mb-4">You can now log in to your account.</p>
              )}
              <Button onClick={() => navigate('/login')} className="w-full max-w-xs">Go to Login</Button>
              <p className="text-xs text-muted-foreground mt-2">You will be redirected to the login page shortly...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && <p className="text-destructive text-xs mt-1">{fieldErrors.name}</p>}
            </div>
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                                      placeholder="254740505584"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                aria-invalid={!!fieldErrors.phone}
              />
              {fieldErrors.phone && <p className="text-destructive text-xs mt-1">{fieldErrors.phone}</p>}
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
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </Button>

            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>
                <GoogleLoginButton />
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;