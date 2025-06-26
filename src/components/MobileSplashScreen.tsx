
import { useEffect, useState } from 'react';
import { useCapacitor } from '@/hooks/use-capacitor';

const MobileSplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isNative, isReady } = useCapacitor();

  useEffect(() => {
    if (isReady && isNative) {
      // Hide splash screen after app is ready
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Hide Capacitor splash screen if available
        if (window.Capacitor?.Plugins?.SplashScreen) {
          window.Capacitor.Plugins.SplashScreen.hide();
        }
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, [isNative, isReady]);

  if (!showSplash || !isNative) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-legal-primary rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-legal-primary mb-2">أجندة</h1>
        <p className="text-gray-600">نظام إدارة مكتب المحاماة</p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-primary mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileSplashScreen;
