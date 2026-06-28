import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<Props> = ({
  icon = 'checkmark-done-circle-outline',
  title,
  subtitle,
}) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.chipBg },
        ]}
      >
        <Ionicons name={icon} size={48} color={theme.colors.textTertiary} />
      </View>
      <ThemedText variant="h2" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText
          variant="body"
          color={theme.colors.textTertiary}
          style={styles.subtitle}
        >
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 280,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { textAlign: 'center', marginBottom: 6 },
  subtitle: { textAlign: 'center' },
});
