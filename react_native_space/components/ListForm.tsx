import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { EMOJI_OPTIONS, LIST_COLORS, FONTS } from '../theme/theme';
import { hapticLight } from '../utils/haptics';

interface Props {
  initialName?: string;
  initialEmoji?: string;
  initialColor?: string;
  onChange: (data: { name: string; emoji: string; color: string }) => void;
}

export const ListForm: React.FC<Props> = ({
  initialName = '',
  initialEmoji = '\uD83D\uDCCB',
  initialColor = '#007AFF',
  onChange,
}) => {
  const { theme } = useTheme();
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [color, setColor] = useState(initialColor);

  const update = (next: Partial<{ name: string; emoji: string; color: string }>) => {
    const merged = { name, emoji, color, ...next };
    setName(merged.name);
    setEmoji(merged.emoji);
    setColor(merged.color);
    onChange(merged);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.previewWrap}>
          <View style={[styles.preview, { backgroundColor: color }]}>
            <ThemedText variant="display" style={styles.previewEmoji}>
              {emoji}
            </ThemedText>
          </View>
        </View>

        <TextInput
          value={name}
          onChangeText={(t) => update({ name: t })}
          placeholder="Nombre de la lista"
          placeholderTextColor={theme.colors.textTertiary}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBg,
              color: theme.colors.text,
              fontFamily: FONTS.regular,
            },
          ]}
          accessibilityLabel="Nombre de la lista"
        />

        <ThemedText variant="captionBold" color={theme.colors.textTertiary} style={styles.section}>
          EMOJI
        </ThemedText>
        <View style={styles.grid}>
          {EMOJI_OPTIONS.map((e) => (
            <Pressable
              key={e}
              onPress={() => {
                hapticLight();
                update({ emoji: e });
              }}
              style={[
                styles.emojiCell,
                {
                  backgroundColor:
                    e === emoji ? theme.colors.primary : theme.colors.inputBg,
                },
              ]}
              accessibilityRole="button"
            >
              <ThemedText variant="h2">{e}</ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText variant="captionBold" color={theme.colors.textTertiary} style={styles.section}>
          COLOR
        </ThemedText>
        <View style={styles.grid}>
          {LIST_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => {
                hapticLight();
                update({ color: c });
              }}
              style={[
                styles.colorCell,
                { backgroundColor: c, borderWidth: c === color ? 3 : 0 },
                { borderColor: theme.colors.text },
              ]}
              accessibilityRole="button"
            />
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  previewWrap: { alignItems: 'center', marginVertical: 16 },
  preview: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: { fontSize: 40 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  section: { marginTop: 20, marginBottom: 10, letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  emojiCell: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  colorCell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 5,
  },
});
