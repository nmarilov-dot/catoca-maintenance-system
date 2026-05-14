import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationRU from './locales/ru.json';
import translationPT from './locales/pt.json';

const resources = {
  ru: {
    translation: translationRU
  },
  pt: {
    translation: translationPT
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
