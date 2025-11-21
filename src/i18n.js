import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "./locales/en/translation.json";
import hiTranslations from "./locales/hi/translation.json";
import bnTranslations from "./locales/bn/translation.json";
import mrTranslations from "./locales/mr/translation.json";
import taTranslations from "./locales/ta/translation.json";
import teTranslations from "./locales/te/translation.json";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: enTranslations },
			hi: { translation: hiTranslations },
			bn: { translation: bnTranslations },
			mr: { translation: mrTranslations },
			ta: { translation: taTranslations },
			te: { translation: teTranslations },
		},
		fallbackLng: "en",
		debug: false,
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;

