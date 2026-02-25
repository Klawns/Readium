import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.br.klaus.readium',
  appName: 'Readium',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: [
      '192.168.31.168',
      '192.168.31.168:7717',
      '192.168.31.150',
      '192.168.31.150:7717',
      '10.0.2.2',
      '10.0.2.2:7717',
      'localhost',
      'localhost:7717',
      '192.168.0.22',
      '192.168.0.22:7717'
    ],
  },
};

export default config;
