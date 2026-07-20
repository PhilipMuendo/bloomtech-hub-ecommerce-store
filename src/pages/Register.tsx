import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleLoginButton from '@/components/GoogleLoginButton';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Sign up with your Google account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <GoogleLoginButton />
            ) : (
              <p className="text-sm text-destructive text-center">
                Google sign-in is not configured. Please contact support.
              </p>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-primary underline">
                Log in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
