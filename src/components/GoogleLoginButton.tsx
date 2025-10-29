import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleLoginButton: React.FC = () => {
  const { googleLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCredentialResponse = React.useCallback(async (response: any) => {
    try {
      await googleLogin(response.credential);
      toast({
        title: "Success",
        description: "Logged in with Google successfully",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Google login failed",
        variant: "destructive",
      });
    }
  }, [googleLogin, toast, navigate]);

  React.useEffect(() => {
    // Check if Google Client ID is configured
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID is not configured. Google login will not work.');
      return;
    }

    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
          });

          const buttonContainer = document.getElementById('google-login-button');
          if (buttonContainer) {
            window.google.accounts.id.renderButton(buttonContainer, {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: '100%',
            });
          }
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
      // Clean up button if it exists
      const buttonContainer = document.getElementById('google-login-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
      }
    };
  }, [handleCredentialResponse]);

  // Always render container - Google script will handle rendering the button if configured
  return (
    <div className="w-full">
      <div id="google-login-button" className="w-full"></div>
    </div>
  );
};

export default GoogleLoginButton;
