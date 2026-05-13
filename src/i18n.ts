import zh from './dict-zh.json';
import en from './dict-en.json';

const dicts: Record<string, Record<string, string>> = { zh, en };

let currentLang = 'zh';
try {
  const saved = localStorage.getItem('app_language');
  if (saved && dicts[saved]) currentLang = saved;
} catch (e) {}

export const setLanguage = (lang: string) => {
  if (dicts[lang] && lang !== currentLang) {
    currentLang = lang;
    try { localStorage.setItem('app_language', lang); } catch (e) {}
    window.location.reload();
  }
};

export const getLanguage = () => currentLang;

export const t = (key: string): string => {
  if (!key) return key;
  const dict = dicts[currentLang];
  if (dict && dict[key] !== undefined) return dict[key];
  return key;
};
