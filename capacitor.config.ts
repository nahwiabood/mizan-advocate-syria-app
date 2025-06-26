
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.586f74d18b3b40509c5de85b71758c35',
  appName: 'أجندة - نظام إدارة مكتب المحاماة',
  webDir: 'dist',
  server: {
    url: 'https://586f74d1-8b3b-4050-9c5d-e85b71758c35.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
