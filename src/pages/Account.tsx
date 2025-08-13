import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Save, 
  Key,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

const Account = () => {
  const { user, login, updateUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string; newPassword?: string; confirmPassword?: string }>({});
  const [emailChanged, setEmailChanged] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { newPassword?: string; confirmPassword?: string } = {};
    if (newPassword.length < 6) errors.newPassword = 'New password must be at least 6 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPasswordLoading(true);
    try {
      // Replace with your real API endpoint
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) throw new Error('Failed to change password');
      toast({ title: 'Success', description: 'Password changed!' });
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Password change failed', variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
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
      <div className="max-w-2xl mx-auto">
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
            <p className="text-gray-600">Manage your account details and security settings</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
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
                     Required for Pesapal payments. Format: 254740505584, +254740505584, or 0740505584
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

          {/* Security Settings */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Security Settings</CardTitle>
                  <CardDescription>Manage your password and account security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-500">Last changed recently</p>
                    </div>
                  </div>
                  <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline"
                        className="border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      >
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5" />
                          Change Password
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-3">
                          <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                          <div className="relative">
                            <Input 
                              id="currentPassword" 
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword} 
                              onChange={e => setCurrentPassword(e.target.value)} 
                              required 
                              disabled={passwordLoading}
                              className="pr-10 h-11"
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                          <div className="relative">
                            <Input 
                              id="newPassword" 
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword} 
                              onChange={e => setNewPassword(e.target.value)} 
                              required 
                              disabled={passwordLoading}
                              aria-invalid={!!fieldErrors.newPassword}
                              className={`pr-10 h-11 ${fieldErrors.newPassword ? 'border-red-300' : ''}`}
                              placeholder="Enter new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          {fieldErrors.newPassword && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors.newPassword}
                            </p>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                          <div className="relative">
                            <Input 
                              id="confirmPassword" 
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword} 
                              onChange={e => setConfirmPassword(e.target.value)} 
                              required 
                              disabled={passwordLoading}
                              aria-invalid={!!fieldErrors.confirmPassword}
                              className={`pr-10 h-11 ${fieldErrors.confirmPassword ? 'border-red-300' : ''}`}
                              placeholder="Confirm new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          {fieldErrors.confirmPassword && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {fieldErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={passwordLoading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            {passwordLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Updating Password...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Update Password
                              </div>
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Account Status</p>
                      <p className="text-sm text-blue-700">Your account is active and secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Stats */}
        <Card className="mt-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-blue-900">{user?.name?.split(' ').length || 0}</p>
                <p className="text-sm text-blue-700">Account Type</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-green-900">Active</p>
                <p className="text-sm text-green-700">Account Status</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-purple-900">Premium</p>
                <p className="text-sm text-purple-700">Account Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account; 