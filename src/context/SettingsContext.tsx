import React, { createContext, useContext, useEffect, useState } from 'react';

export interface SiteSettings {
  id?: number;
  companyName?: string | null;
  companyTagline?: string | null;
  companyFullName?: string | null;
  logoType?: 'text' | 'image';
  logoImageSrc?: string | null;
  logoIconSrc?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  reload: async () => {}
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load site settings:', error);
      // Fail silently - app will use fallback branding
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, reload }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

