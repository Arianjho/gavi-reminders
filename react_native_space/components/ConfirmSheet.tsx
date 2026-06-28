import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { hapticMedium } from '../utils/haptics';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmSheet: React.FC<Props> = ({
  visible,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  destructive = true,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
        onPress={onCancel}
      >
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.card, paddingBottom: insets.bottom + 16 },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          <ThemedText variant="h2" style={styles.title}>
            {title}
          </ThemedText>
          {message ? (
            <ThemedText
              variant="body"
              color={theme.colors.textTertiary}
              style={styles.message}
            >
              {message}
            </ThemedText>
          ) : null}
          <Pressable
            onPress={() => {
              hapticMedium();
              onConfirm();
            }}
            style={[
              styles.btn,
              { backgroundColor: destructive ? theme.colors.danger : theme.colors.primary },
            ]}
            accessibilityRole="button"
          >
            <ThemedText variant="bodyBold" color="#FFFFFF">
              {confirmLabel}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={onCancel}
            style={[styles.btn, { backgroundColor: theme.colors.inputBg }]}
            accessibilityRole="button"
          >
            <ThemedText variant="bodyBold" color={theme.colors.text}>
              {cancelLabel}
            </ThemedText>
          </Pressable>
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
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { textAlign: 'center', marginBottom: 6 },
  message: { textAlign: 'center', marginBottom: 16 },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
});
