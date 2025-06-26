
import { useEffect, useState } from 'react';

interface CapacitorInfo {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  isReady: boolean;
}

export function useCapacitor(): CapacitorInfo {
  const [capacitorInfo, setCapacitorInfo] = useState<CapacitorInfo>({
    isNative: false,
    platform: 'web',
    isReady: false
  });

  useEffect(() => {
    const checkCapacitor = async () => {
      try {
        // Check if Capacitor is available
        if (typeof window !== 'undefined' && window.Capacitor) {
          const { Capacitor } = window;
          
          setCapacitorInfo({
            isNative: Capacitor.isNativePlatform(),
            platform: Capacitor.getPlatform() as 'web' | 'ios' | 'android',
            isReady: true
          });
        } else {
          setCapacitorInfo({
            isNative: false,
            platform: 'web',
            isReady: true
          });
        }
      } catch (error) {
        console.log('Capacitor not available:', error);
        setCapacitorInfo({
          isNative: false,
          platform: 'web',
          isReady: true
        });
      }
    };

    checkCapacitor();
  }, []);

  return capacitorInfo;
}

// Add global type for Capacitor with correct structure
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
      Plugins?: {
        SplashScreen?: {
          hide: () => Promise<void>;
        };
      };
    };
  }
}
