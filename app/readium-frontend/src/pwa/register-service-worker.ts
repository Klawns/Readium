import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';

let hasRegistered = false;

export const registerServiceWorker = (): void => {
  if (hasRegistered) {
    return;
  }
  if (!import.meta.env.PROD) {
    return;
  }
  if (Capacitor.getPlatform() !== 'web') {
    return;
  }

  hasRegistered = true;
  registerSW({
    immediate: true,
    onRegisterError: (error) => {
      console.error('Falha ao registrar service worker.', error);
    },
  });
};
