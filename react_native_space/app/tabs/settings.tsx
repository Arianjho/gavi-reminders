import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ThemedText } from '../../components/ThemedText';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ThemePreference } from '../../types';

export default function Settings() {
  const { theme, preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <ThemedText variant="display" style={styles.heading}>
        Ajustes
      </ThemedText>

      <ThemedText variant="captionBold" color={theme.colors.textTertiary} style={styles.section}>
        APARIENCIA
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <ThemedText variant="body" style={styles.rowLabel}>
          Tema
        </ThemedText>
        <SegmentedControl
          options={[
            { label: 'Claro', value: 'light' },
            { label: 'Oscuro', value: 'dark' },
            { label: 'Sistema', value: 'system' },
          ]}
          value={preference}
          onChange={(v) => setPreference(v as ThemePreference)}
        />
      </View>

      <ThemedText variant="captionBold" color={theme.colors.textTertiary} style={styles.section}>
        DATOS
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.row}>
          <ThemedText variant="body" color={theme.colors.textTertiary}>
            Exportar recordatorios
          </ThemedText>
          <ThemedText variant="caption" color={theme.colors.textTertiary}>
            Próximamente
          </ThemedText>
        </View>
      </View>

      <ThemedText variant="captionBold" color={theme.colors.textTertiary} style={styles.section}>
        ACERCA DE
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.row, { borderBottomColor: theme.colors.separator, borderBottomWidth: StyleSheet.hairlineWidth }]}>
          <ThemedText variant="body">Versión</ThemedText>
          <ThemedText variant="body" color={theme.colors.textTertiary}>1.0.0</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText variant="body">Desarrollado por</ThemedText>
          <ThemedText variant="body" color={theme.colors.textTertiary}>Gavi</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 120 },
  heading: { marginBottom: 16 },
  section: { marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },
  card: { borderRadius: 14, padding: 14 },
  rowLabel: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
});
