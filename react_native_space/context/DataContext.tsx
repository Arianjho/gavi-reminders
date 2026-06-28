import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createReminder,
  deleteList,
  deleteReminder,
  initDatabase,
  setReminderCompleted,
  setReminderNotificationId,
  updateReminder,
} from '../services/database';
import {
  cancelManyNotifications,
  cancelReminderNotification,
  scheduleReminderNotification,
} from '../services/notifications';
import { ReminderInput, ReminderWithMeta } from '../types';

interface DataContextValue {
  ready: boolean;
  initError: string | null;
  refreshToken: number;
  triggerRefresh: () => void;
  saveNewReminder: (input: ReminderInput) => Promise<string | null>;
  editReminder: (
    id: string,
    input: ReminderInput,
    previousNotificationId: string | null
  ) => Promise<void>;
  toggleComplete: (
    reminder: ReminderWithMeta,
    completed: boolean
  ) => Promise<void>;
  removeReminder: (reminder: ReminderWithMeta) => Promise<void>;
  removeList: (listId: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initDatabase();
        if (mounted) setReady(true);
      } catch (e) {
        if (mounted) {
          setInitError(
            'No se pudo inicializar la base de datos. Reinicia la aplicación.'
          );
          setReady(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshToken((t) => t + 1);
  }, []);

  const saveNewReminder = useCallback(
    async (input: ReminderInput): Promise<string | null> => {
      try {
        const id = await createReminder(input);
        const notifId = await scheduleReminderNotification(
          input.title,
          input.notes ?? null,
          input.date ?? null,
          input.time ?? null,
          input.recurrence ?? null,
          input.advanceMinutes ?? 0,
          input.repeatDays ?? null
        );
        if (notifId) await setReminderNotificationId(id, notifId);
        triggerRefresh();
        return id;
      } catch {
        return null;
      }
    },
    [triggerRefresh]
  );

  const editReminder = useCallback(
    async (
      id: string,
      input: ReminderInput,
      previousNotificationId: string | null
    ): Promise<void> => {
      try {
        await cancelReminderNotification(previousNotificationId);
        await updateReminder(id, input);
        const notifId = await scheduleReminderNotification(
          input.title,
          input.notes ?? null,
          input.date ?? null,
          input.time ?? null,
          input.recurrence ?? null,
          input.advanceMinutes ?? 0,
          input.repeatDays ?? null
        );
        await setReminderNotificationId(id, notifId);
        triggerRefresh();
      } catch {
        // no-op
      }
    },
    [triggerRefresh]
  );

  const toggleComplete = useCallback(
    async (reminder: ReminderWithMeta, completed: boolean): Promise<void> => {
      try {
        await setReminderCompleted(reminder.id, completed);
        if (completed) {
          await cancelReminderNotification(reminder.notificationId ?? null);
          await setReminderNotificationId(reminder.id, null);
        } else if (reminder.date) {
          const notifId = await scheduleReminderNotification(
            reminder.title,
            reminder.notes ?? null,
            reminder.date ?? null,
            reminder.time ?? null,
            reminder.recurrence ?? null,
            reminder.advanceMinutes ?? 0,
            reminder.repeatDays ?? null
          );
          await setReminderNotificationId(reminder.id, notifId);
        }
        triggerRefresh();
      } catch {
        // no-op
      }
    },
    [triggerRefresh]
  );

  const removeReminder = useCallback(
    async (reminder: ReminderWithMeta): Promise<void> => {
      try {
        const notifId = await deleteReminder(reminder.id);
        await cancelReminderNotification(notifId ?? reminder.notificationId ?? null);
        triggerRefresh();
      } catch {
        // no-op
      }
    },
    [triggerRefresh]
  );

  const removeList = useCallback(
    async (listId: string): Promise<void> => {
      try {
        const notifIds = await deleteList(listId);
        await cancelManyNotifications(notifIds ?? []);
        triggerRefresh();
      } catch {
        // no-op
      }
    },
    [triggerRefresh]
  );

  const value = useMemo<DataContextValue>(
    () => ({
      ready,
      initError,
      refreshToken,
      triggerRefresh,
      saveNewReminder,
      editReminder,
      toggleComplete,
      removeReminder,
      removeList,
    }),
    [
      ready,
      initError,
      refreshToken,
      triggerRefresh,
      saveNewReminder,
      editReminder,
      toggleComplete,
      removeReminder,
      removeList,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
}
