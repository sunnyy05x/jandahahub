import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

const InstallBanner = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if previously dismissed
    const dismissed = localStorage.getItem('installBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers that don't support beforeinstallprompt or if already installed
      alert('To install the app, use your browser menu and select "Install App" or "Add to Home Screen".');
    }
  };

  if (isDismissed) return null;

  return (
    <div className="mx-4 my-4 p-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl shadow-md text-white relative">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 shrink-0">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold">Install JandahaHub App</h3>
          <p className="text-xs text-teal-50 opacity-90">Get a faster experience & notifications</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleInstallClick}
          className="flex-1 bg-white text-teal-600 font-bold py-2 px-4 rounded-xl text-sm flex items-center justify-center"
        >
          {deferredPrompt ? '📲 Install App' : '📲 Install App'}
        </button>
        {!deferredPrompt && (
          <button 
            onClick={() => alert('APK download is coming soon!')}
            className="flex-1 bg-teal-700/50 hover:bg-teal-700/70 text-white font-bold py-2 px-4 rounded-xl text-sm flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-1" /> APK
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallBanner;
