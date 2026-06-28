import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ReminderWithMeta } from '../types';
import { ReminderItem } from './ReminderItem';
import { EmptyState } from './EmptyState';
import { useTheme } from '../context/ThemeContext';

interface Props {
  reminders: ReminderWithMeta[];
  onToggleComplete: (reminder: ReminderWithMeta, completed: boolean) => void;
  onDelete: (reminder: ReminderWithMeta) => void;
  onPress: (reminder: ReminderWithMeta) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  showTimeOnly?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
}

export const ReminderList: React.FC<Props> = ({
  reminders,
  onToggleComplete,
  onDelete,
  onPress,
  refreshing = false,
  onRefresh,
  emptyTitle = 'No hay recordatorios',
  emptySubtitle,
  showTimeOnly = false,
  ListHeaderComponent = null,
}) => {
  const { theme } = useTheme();
  const data = reminders ?? [];

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item?.id ?? Math.random().toString()}
      renderItem={({ item }) => (
        <ReminderItem
          reminder={item}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onPress={onPress}
          showTimeOnly={showTimeOnly}
        />
      )}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={[
        styles.content,
        data.length === 0 && styles.emptyContent,
      ]}
      ListEmptyComponent={
        <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 120 },
  emptyContent: { flexGrow: 1 },
});
