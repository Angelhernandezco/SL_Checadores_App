import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'SL_Checadores_App',
  webDir: 'www',
  "plugins": {
    "CapacitorHttp": {
      "enabled": true
    }
  }
};

export default config;
