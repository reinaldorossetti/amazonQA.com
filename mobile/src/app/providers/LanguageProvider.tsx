import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { STORAGE_KEYS } from '@/shared/constants/storage';

type Language = 'pt-BR' | 'en-US';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt-BR');

  useEffect(() => {
    const hydrate = async () => {
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.language);
      const value = (storedLanguage === 'en-US' ? 'en-US' : 'pt-BR') as Language;
      setLanguageState(value);
      await i18n.changeLanguage(value);
    };

    void hydrate();
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage: async (nextLanguage: Language) => {
      await AsyncStorage.setItem(STORAGE_KEYS.language, nextLanguage);
      setLanguageState(nextLanguage);
      await i18n.changeLanguage(nextLanguage);
    },
  }), [language]);

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage deve ser usado dentro de LanguageProvider');
  return context;
}
