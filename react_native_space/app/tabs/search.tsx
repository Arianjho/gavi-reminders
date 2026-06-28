import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { ThemedText } from '../../components/ThemedText';
import { ReminderItem } from '../../components/ReminderItem';
import { EmptyState } from '../../components/EmptyState';
import { FONTS } from '../../theme/theme';
import {
  getAllTags,
  getLists,
  searchReminders,
  SearchFilters,
} from '../../services/database';
import { ListItem, ReminderWithMeta, TagWithCount } from '../../types';

type Status = 'all' | 'pending' | 'completed';

export default function Search() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toggleComplete, removeReminder, refreshToken } = useData();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [listId, setListId] = useState<string | null>(null);
  const [tagName, setTagName] = useState<string | null>(null);
  const [results, setResults] = useState<ReminderWithMeta[]>([]);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    (async () => {
      setLists(await getLists());
      setTags(await getAllTags());
    })();
  }, [refreshToken]);

  const runSearch = useCallback(async () => {
    const filters: SearchFilters = { query, status, listId, tagName };
    setResults(await searchReminders(filters));
  }, [query, status, listId, tagName]);

  useEffect(() => {
    if (touched || query.length > 0 || status !== 'all' || listId || tagName) {
      runSearch();
    }
  }, [runSearch, touched, query, status, listId, tagName]);

  const statusOptions: { label: string; value: Status }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Completados', value: 'completed' },
  ];

  const showResults = touched || query.length > 0 || status !== 'all' || !!listId || !!tagName;

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <ThemedText variant="display">Buscar</ThemedText>
      </View>
      <View style={[styles.searchBar, { backgroundColor: theme.colors.inputBg }]}>
        <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setTouched(true);
          }}
          placeholder="Buscar recordatorios..."
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.searchInput, { color: theme.colors.text, fontFamily: FONTS.regular }]}
          accessibilityLabel="Buscar recordatorios"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        {statusOptions.map((opt) => {
          const active = status === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                setStatus(opt.value);
                setTouched(true);
              }}
              style={[styles.filterChip, { backgroundColor: active ? theme.colors.primary : theme.colors.chipBg }]}
            >
              <ThemedText variant="caption" color={active ? '#FFFFFF' : theme.colors.chipText}>
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
        {lists.map((l) => {
          const active = listId === l.id;
          return (
            <Pressable
              key={l.id}
              onPress={() => {
                setListId(active ? null : l.id);
                setTouched(true);
              }}
              style={[styles.filterChip, { backgroundColor: active ? l.color : theme.colors.chipBg }]}
            >
              <ThemedText variant="caption" color={active ? '#FFFFFF' : theme.colors.chipText}>
                {l.emoji} {l.name}
              </ThemedText>
            </Pressable>
          );
        })}
        {tags.map((t) => {
          const active = tagName === t.name;
          return (
            <Pressable
              key={t.id}
              onPress={() => {
                setTagName(active ? null : t.name);
                setTouched(true);
              }}
              style={[styles.filterChip, { backgroundColor: active ? theme.colors.primary : theme.colors.chipBg }]}
            >
              <ThemedText variant="caption" color={active ? '#FFFFFF' : theme.colors.chipText}>
                #{t.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {!showResults ? (
        <EmptyState icon="search" title="Escribe para buscar" subtitle="Encuentra tus recordatorios por palabra, lista o etiqueta." />
      ) : results.length === 0 ? (
        <EmptyState icon="search" title="Sin resultados" subtitle="Prueba con otra búsqueda o filtro." />
      ) : (
        <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>
          {results.map((r) => (
            <ReminderItem
              key={r.id}
              reminder={r}
              onToggleComplete={toggleComplete}
              onDelete={removeReminder}
              onPress={(rem) => router.push(`/reminder/${rem.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  filters: { marginTop: 12, maxHeight: 44 },
  filtersContent: { paddingHorizontal: 16, alignItems: 'center' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, marginRight: 8 },
  results: { padding: 16, paddingBottom: 120 },
});
