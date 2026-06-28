import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

interface Props {
  mode: 'date' | 'time';
  value: Date;
  onChange: (date: Date) => void;
  display: string;
}

export const DateTimeField: React.FC<Props> = ({ mode, value, onChange, display }) => {
  const { theme, isDark } = useTheme();
  const [show, setShow] = useState(Platform.OS === 'ios');

  if (Platform.OS === 'web') {
    const toInputValue = () => {
      try {
        if (mode === 'date') {
          const y = value.getFullYear();
          const m = String(value.getMonth() + 1).padStart(2, '0');
          const d = String(value.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
        const hh = String(value.getHours()).padStart(2, '0');
        const mm = String(value.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      } catch {
        return '';
      }
    };
    return (
      // @ts-ignore - web-only DOM input
      <input
        type={mode}
        value={toInputValue()}
        onChange={(e: any) => {
          const v = e?.target?.value ?? '';
          if (mode === 'date') {
            const [y, m, d] = v.split('-').map((n: string) => parseInt(n, 10));
            if (y && m && d) {
              const nd = new Date(value);
              nd.setFullYear(y, m - 1, d);
              onChange(nd);
            }
          } else {
            const [hh, mm] = v.split(':').map((n: string) => parseInt(n, 10));
            const nd = new Date(value);
            nd.setHours(hh || 0, mm || 0, 0, 0);
            onChange(nd);
          }
        }}
        style={{
          backgroundColor: theme.colors.inputBg,
          color: theme.colors.text,
          border: 'none',
          borderRadius: 10,
          padding: 10,
          fontSize: 16,
          colorScheme: isDark ? 'dark' : 'light',
        }}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        mode={mode}
        value={value}
        themeVariant={isDark ? 'dark' : 'light'}
        onChange={(_e, d) => {
          if (d) onChange(d);
        }}
        is24Hour
      />
    );
  }

  return (
    <View>
      <Pressable
        onPress={() => setShow(true)}
        style={[styles.androidBtn, { backgroundColor: theme.colors.inputBg }]}
      >
        <ThemedText variant="bodyBold" color={theme.colors.primary}>
          {display}
        </ThemedText>
      </Pressable>
      {show ? (
        <DateTimePicker
          mode={mode}
          value={value}
          is24Hour
          onChange={(_e, d) => {
            setShow(false);
            if (d) onChange(d);
          }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  androidBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
