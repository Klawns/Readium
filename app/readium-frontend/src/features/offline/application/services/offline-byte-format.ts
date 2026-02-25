const UNITS = ['B', 'KB', 'MB', 'GB'];

export const formatBytes = (value: number): string => {
  const safeValue = Math.max(0, value);
  if (safeValue === 0) {
    return '0 B';
  }

  const unitIndex = Math.min(Math.floor(Math.log(safeValue) / Math.log(1024)), UNITS.length - 1);
  const amount = safeValue / (1024 ** unitIndex);
  const fractionDigits = unitIndex === 0 ? 0 : 1;
  return `${amount.toFixed(fractionDigits)} ${UNITS[unitIndex]}`;
};
