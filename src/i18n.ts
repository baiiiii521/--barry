import React, { useState, useEffect, createContext, useContext } from 'react';
import zh from './dict-zh.json';
import en from './dict-en.json';

const dicts: Record<string, Record<string, string>> = {
  zh,
  en
};

let currentLang = 'zh';

try {
  const saved = localStorage.getItem('app_language');
  if (saved && dicts[saved]) {
    currentLang = saved;
  }
} catch (e) {}

type Listener = () => void;
const listeners = new Set<Listener>();

export const setLanguage = (lang: string) => {
  if (dicts[lang] && lang !== currentLang) {
    currentLang = lang;
    localStorage.setItem('app_language', lang);
    window.location.reload();
  }
};

export const getLanguage = () => currentLang;

export const t = (key: string): string => {
  if (!key) return key;
  const dict = dicts[currentLang];
  if (dict && dict[key] !== undefined) {
    return dict[key];
  }
  return key; // fallback to key itself
};

export const useTranslation = () => {
  const [lang, setLang] = useState(currentLang);

  useEffect(() => {
    const handler = () => setLang(currentLang);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return { t, lang, setLanguage };
};
