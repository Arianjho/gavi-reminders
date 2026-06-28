import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { hapticLight } from '../utils/haptics';

export interface SheetOption {
  label: string;
  value: string;
  emoji?: string;
  color?: string;
}

interface Props {
  visible: boolean;
  title: string;
  options: SheetOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const OptionSheet: React.FC<Props> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.card,
              paddingBottom: insets.bottom + 16,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          <ThemedText variant="h2" style={styles.title}>
            {title}
          </ThemedText>
          {options.map((opt) => {
            const active = opt.value === selectedValue;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  hapticLight();
                  onSelect(opt.value);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: pressed
                      ? theme.colors.inputBg
                      : 'transparent',
                    borderBottomColor: theme.colors.separator,
                  },
                ]}
                accessibilityRole="button"
              >
                <View style={styles.optionLeft}>
                  {opt.color ? (
                    <View style={[styles.colorDot, { backgroundColor: opt.color }]} />
                  ) : null}
                  {opt.emoji ? (
                    <ThemedText variant="body" style={styles.optEmoji}>
                      {opt.emoji}
                    </ThemedText>
                  ) : null}
                  <ThemedText variant="body">{opt.label}</ThemedText>
                </View>
                {active ? (
                  <Ionicons name="checkmark" size={22} color={theme.colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { marginBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 18, height: 18, borderRadius: 9, marginRight: 10 },
  optEmoji: { fontSize: 18, marginRight: 10 },
});
