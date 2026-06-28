import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { ListWithCount } from '../types';
import { hapticLight } from '../utils/haptics';

interface Props {
  list: ListWithCount;
  onPress: (list: ListWithCount) => void;
}

export const ListRow: React.FC<Props> = ({ list, onPress }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress(list);
      }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.colors.card, opacity: pressed ? 0.7 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Lista ${list.name}, ${list.pendingCount} pendientes`}
    >
      <View style={[styles.emojiCircle, { backgroundColor: list.color }]}>
        <ThemedText variant="body" style={styles.emoji}>
          {list.emoji}
        </ThemedText>
      </View>
      <ThemedText variant="bodyBold" style={styles.name} numberOfLines={1}>
        {list.name}
      </ThemedText>
      <ThemedText variant="body" color={theme.colors.textTertiary} style={styles.count}>
        {list.pendingCount}
      </ThemedText>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  emojiCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: { fontSize: 18 },
  name: { flex: 1 },
  count: { marginRight: 8 },
});
