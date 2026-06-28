export type Recurrence = 'diario' | 'interdiario' | 'semanal' | 'semanal_dias' | 'mensual';

export type ThemePreference = 'light' | 'dark' | 'system';

export type SmartType = 'hoy' | 'programadas' | 'todas' | 'marcadas';

export interface ListItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListWithCount extends ListItem {
  pendingCount: number;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface TagWithCount extends Tag {
  count: number;
}

export interface Reminder {
  id: string;
  title: string;
  notes: string | null;
  date: string | null;
  time: string | null;
  isCompleted: number;
  isFlagged: number;
  recurrence: Recurrence | null;
  listId: string | null;
  notificationId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  advanceMinutes: number;
  repeatDays: number[] | null;
}

export interface ReminderWithMeta extends Reminder {
  tags: Tag[];
  list: ListItem | null;
}

export interface ReminderInput {
  title: string;
  notes: string | null;
  date: string | null;
  time: string | null;
  isFlagged: number;
  recurrence: Recurrence | null;
  listId: string | null;
  tagNames: string[];
  advanceMinutes: number;
  repeatDays: number[] | null;
}
