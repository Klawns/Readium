import { GOOGLE_TRANSLATE_TARGET_LANGUAGE } from './pdfReader.constants';

export const buildGoogleTranslateUrl = (text: string) =>
  `https://translate.google.com/?sl=auto&tl=${GOOGLE_TRANSLATE_TARGET_LANGUAGE}&text=${encodeURIComponent(text)}&op=translate`;
