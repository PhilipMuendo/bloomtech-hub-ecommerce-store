import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const { user, login, updateUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; newPassword?: string; confirmPassword?: string }>({});
  const [emailChanged, setEmailChanged] = useState(false);
  const navigate = useNavigate();

  const token = user?.token || (typeof window !== 'undefined' && localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).token);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string } = {};
    if (!name.trim()) errors.name = 'Name cannot be empty';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Invalid email format';
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
        body: JSON.stringify({ name, email })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      toast({ title: 'Success', description: 'Profile updated successfully!' });
      // Update context/localStorage with new user info
      if (updated && updated.user && updated.user.name && updated.user.email) {
        const newUser = { ...user, name: updated.user.name, email: updated.user.email };
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Changed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Your email has been changed. Please check your new email to verify your account before logging in again.</p>
            <p className="text-muted-foreground text-sm mb-4">Didn't receive the email? Check your spam folder or <a href="/resend-verification" className="text-primary underline">resend verification</a>.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>My Account</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required disabled={saving} aria-invalid={!!fieldErrors.name} />
              {fieldErrors.name && <p className="text-destructive text-xs mt-1">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={saving} aria-invalid={!!fieldErrors.email} />
              {fieldErrors.email && <p className="text-destructive text-xs mt-1">{fieldErrors.email}</p>}
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required disabled={passwordLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={passwordLoading} aria-invalid={!!fieldErrors.newPassword} />
                      {fieldErrors.newPassword && <p className="text-destructive text-xs mt-1">{fieldErrors.newPassword}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={passwordLoading} aria-invalid={!!fieldErrors.confirmPassword} />
                      {fieldErrors.confirmPassword && <p className="text-destructive text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? 'Saving...' : 'Save Password'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account; 