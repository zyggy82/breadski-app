import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.breadski.orders',
  appName: 'Breadski Orders',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    Keyboard: {
      resize: 'body' // lub 'native' jeśli 'body' nie zadziała idealnie
    }
  }
};

export default config;
