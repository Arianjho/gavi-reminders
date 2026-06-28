import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from '../components/ThemedText';

export default function NotFound() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <ThemedText variant="h1" style={styles.title}>
        Página no encontrada
      </ThemedText>
      <Link href="/tabs">
        <ThemedText variant="bodyBold" color={theme.colors.primary}>
          Volver al inicio
        </ThemedText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { marginBottom: 16, textAlign: 'center' },
});
