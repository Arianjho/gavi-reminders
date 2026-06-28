import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { FlatList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { ThemedText } from '../components/ThemedText';
import { EmptyState } from '../components/EmptyState';
import { getAllTags, deleteTag } from '../services/database';
import { TagWithCount } from '../types';
import { hapticLight } from '../utils/haptics';

export default function TagsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { triggerRefresh, refreshToken } = useData();
  const [tags, setTags] = useState<TagWithCount[]>([]);

  const load = useCallback(async () => {
    setTags(await getAllTags());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshToken])
  );

  const handleDelete = async (id: string) => {
    await deleteTag(id);
    triggerRefresh();
    load();
  };

  const renderRow = (t: TagWithCount) => (
    <Pressable
      onPress={() => {
        hapticLight();
        router.push(`/tag/${encodeURIComponent(t.name)}`);
      }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.colors.card, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Ionicons name="pricetag" size={18} color={theme.colors.primary} />
      <ThemedText variant="bodyBold" style={styles.name}>#{t.name}</ThemedText>
      <ThemedText variant="body" color={theme.colors.textTertiary} style={styles.count}>
        {t.count}
      </ThemedText>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
    </Pressable>
  );

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Etiquetas" />
      <FlatList
        data={tags}
        keyExtractor={(t) => t.id}
        contentContainerStyle={[styles.content, tags.length === 0 && styles.empty]}
        ListEmptyComponent={<EmptyState icon="pricetags-outline" title="No hay etiquetas" />}
        renderItem={({ item }) =>
          Platform.OS === 'web' ? (
            <View style={styles.webRow}>
              {renderRow(item)}
              <Pressable onPress={() => handleDelete(item.id)} style={styles.webDelete}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              </Pressable>
            </View>
          ) : (
            <Swipeable
              renderRightActions={() => (
                <Pressable
                  style={[styles.deleteAction, { backgroundColor: theme.colors.danger }]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                </Pressable>
              )}
              overshootRight={false}
            >
              {renderRow(item)}
            </Swipeable>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  empty: { flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  name: { flex: 1, marginLeft: 10 },
  count: { marginRight: 8 },
  webRow: { position: 'relative' },
  webDelete: { position: 'absolute', right: 44, top: 14, padding: 4 },
  deleteAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 8,
  },
});
