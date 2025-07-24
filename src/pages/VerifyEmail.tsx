import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed.');
      });
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/20 animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary mb-2">Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6">
            {status === 'pending' && (
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="#0ea5e9" strokeWidth="4" fill="none" /></svg>
            )}
            {status === 'success' && (
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#e0f2fe"/><path d="M7 13l3 3 7-7" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {status === 'error' && (
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fee2e2"/><path d="M8 8l8 8M8 16L16 8" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/></svg>
            )}
            <p className={`text-lg font-semibold ${status === 'success' ? 'text-green-700' : status === 'error' ? 'text-red-600' : 'text-primary'}`}>{message}</p>
            <Button onClick={() => navigate('/login')} className="w-full max-w-xs">Go to Login</Button>
            {status === 'success' && <p className="text-xs text-muted-foreground mt-2">You will be redirected to the login page shortly...</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail; 