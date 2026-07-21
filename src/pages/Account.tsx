import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  CheckCircle,
  AlertCircle,
  Save,
  ArrowLeft,
} from 'lucide-react';

const Account = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [emailChanged, setEmailChanged] = useState(false);
  const navigate = useNavigate();

  const token = user?.token || (typeof window !== 'undefined' && localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).token);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) errors.name = 'Name cannot be empty';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Invalid email format';
    if (phone && !/^(\+254|0)?[17]\d{8}$/.test(phone)) errors.phone = 'Please enter a valid Kenyan phone number (e.g., 254740505584, +254740505584, or 0740505584)';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      // Replace with your real API endpoint
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ name, email, phone })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      toast({ title: 'Success', description: 'Profile updated successfully!' });
      // Update context/localStorage with new user info
      if (updated && updated.user && updated.user.name && updated.user.email) {
        const newUser = { ...user, name: updated.user.name, email: updated.user.email, phone: updated.user.phone };
        updateUser(newUser);
        if (updated.user.verified === false) {
          setEmailChanged(true);
          localStorage.removeItem('user');
        }
      }
      setTimeout(() => navigate('/shop'), 1000);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Update failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (emailChanged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">Email Changed</CardTitle>
            <CardDescription className="text-gray-600">Your email has been updated successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Verification Required</p>
                  <p>Please check your new email to verify your account before logging in again.</p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Didn't receive the email? Check your spam folder or{' '}
              <a href="/resend-verification" className="text-primary underline hover:text-primary/80">
                resend verification
              </a>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-600">Manage your account details</p>
          </div>
        </div>

        {/* Profile Information */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    disabled={saving}
                    aria-invalid={!!fieldErrors.name}
                    className={`pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${fieldErrors.name ? 'border-red-300' : ''}`}
                    placeholder="Enter your full name"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {fieldErrors.name && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={saving}
                    aria-invalid={!!fieldErrors.email}
                    className={`pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${fieldErrors.email ? 'border-red-300' : ''}`}
                    placeholder="Enter your email address"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={saving}
                    aria-invalid={!!fieldErrors.phone}
                    className={`pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${fieldErrors.phone ? 'border-red-300' : ''}`}
                    placeholder="254740505584 (optional)"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {fieldErrors.phone && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.phone}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Required for payment processing. Format: 254740505584, +254740505584, or 0740505584
                </p>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving Changes...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
