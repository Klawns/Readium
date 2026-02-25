export const isDeviceOnline = (): boolean => {
  if (typeof navigator === 'undefined') {
    return true;
  }
  return navigator.onLine;
};
