import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.marakifoodzones.app',
  appName: 'Maraki Food Zones',
  webDir: 'out',
  server: {
    cleartext: true
  }
};

export default config;
