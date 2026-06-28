import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from '../theme/theme';
import { ThemePreference } from '../types';
import { getThemePreference, setThemePreference } from '../services/database';

interface ThemeContextValue {
  theme: AppTheme;
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [preference, setPref] = useState<ThemePreference>('system');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getThemePreference();
      if (mounted) setPref(stored);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updatePreference = useCallback((pref: ThemePreference) => {
    setPref(pref);
    setThemePreference(pref).catch(() => undefined);
  }, []);

  const isDark = useMemo(() => {
    if (preference === 'system') return systemScheme === 'dark';
    return preference === 'dark';
  }, [preference, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      preference,
      isDark,
      setPreference: updatePreference,
    }),
    [isDark, preference, updatePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: lightTheme,
      preference: 'system',
      isDark: false,
      setPreference: () => undefined,
    };
  }
  return ctx;
}
