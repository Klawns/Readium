export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(normalized);
    return true;
  }

  const textarea = document.createElement('textarea');
  textarea.value = normalized;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
};
