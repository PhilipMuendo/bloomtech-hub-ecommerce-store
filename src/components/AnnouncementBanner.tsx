import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const DISMISS_KEY = 'announcementDismissed';

const AnnouncementBanner = () => {
  const { settings } = useSettings();
  const [dismissedText, setDismissedText] = useState<string | null>(() =>
    sessionStorage.getItem(DISMISS_KEY)
  );

  const text = settings?.announcementText;
  if (!settings?.announcementEnabled || !text || dismissedText === text) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, text);
    setDismissedText(text);
  };

  return (
    <div className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm text-center relative">
        <span className="pr-6">{text}</span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-4 opacity-80 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
