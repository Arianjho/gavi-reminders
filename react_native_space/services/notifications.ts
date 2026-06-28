import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Recurrence } from '../types';

const isWeb = Platform.OS === 'web';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // no-op on unsupported platforms
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings?.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req?.granted;
  } catch {
    return false;
  }
}

// weekday 1=Dom, 2=Lun, ..., 7=Sáb (expo convention)
// Spanish day 1=Lun..7=Dom  →  expoDay = (spanishDay % 7) + 1
function spanishDayToExpo(day: number): number {
  return (day % 7) + 1;
}

function buildTriggerDate(date: string, time: string | null, advanceMinutes: number): Date | null {
  try {
    const [y, m, d] = (date ?? '').split('-').map((n) => parseInt(n, 10));
    if (!y || !m || !d) return null;
    let hh = 9;
    let mm = 0;
    if (time) {
      const parts = time.split(':');
      hh = parseInt(parts?.[0] ?? '9', 10);
      mm = parseInt(parts?.[1] ?? '0', 10);
    }
    const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
    if (advanceMinutes > 0) dt.setMinutes(dt.getMinutes() - advanceMinutes);
    return dt;
  } catch {
    return null;
  }
}

// Parse notificationId — may be a single ID string or a JSON array string
function parseNotifIds(notifId: string | null): string[] {
  if (!notifId) return [];
  try {
    if (notifId.startsWith('[')) return JSON.parse(notifId) as string[];
    return [notifId];
  } catch {
    return [notifId];
  }
}

export async function scheduleReminderNotification(
  title: string,
  notes: string | null,
  date: string | null,
  time: string | null,
  recurrence: Recurrence | null,
  advanceMinutes: number = 0,
  repeatDays: number[] | null = null
): Promise<string | null> {
  if (isWeb) return null;
  if (!date) return null;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;
    const triggerDate = buildTriggerDate(date, time, advanceMinutes);
    if (!triggerDate) return null;

    const isPast = triggerDate.getTime() <= Date.now();
    const content: Notifications.NotificationContentInput = {
      title: title || 'Recordatorio',
      body: notes || 'Tienes un recordatorio pendiente.',
      sound: true,
    };

    if (recurrence === 'diario') {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: triggerDate.getHours(),
          minute: triggerDate.getMinutes(),
        },
      });
      return id ?? null;

    } else if (recurrence === 'interdiario') {
      // Every 48 hours repeating from trigger date
      if (isPast) return null;
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2 * 24 * 3600,
          repeats: true,
        },
      });
      return id ?? null;

    } else if (recurrence === 'semanal') {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: triggerDate.getDay() + 1,
          hour: triggerDate.getHours(),
          minute: triggerDate.getMinutes(),
        },
      });
      return id ?? null;

    } else if (recurrence === 'semanal_dias' && repeatDays && repeatDays.length > 0) {
      // Schedule one notification per selected day, store IDs as JSON array
      const ids: string[] = [];
      for (const spanishDay of repeatDays) {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: spanishDayToExpo(spanishDay),
            hour: triggerDate.getHours(),
            minute: triggerDate.getMinutes(),
          },
        });
        if (id) ids.push(id);
      }
      return ids.length ? JSON.stringify(ids) : null;

    } else if (recurrence === 'mensual') {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
          day: triggerDate.getDate(),
          hour: triggerDate.getHours(),
          minute: triggerDate.getMinutes(),
        },
      });
      return id ?? null;

    } else {
      if (isPast) return null;
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      return id ?? null;
    }
  } catch {
    return null;
  }
}

export async function cancelReminderNotification(
  notificationId: string | null
): Promise<void> {
  if (isWeb || !notificationId) return;
  try {
    const ids = parseNotifIds(notificationId);
    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch {
    // no-op
  }
}

export async function cancelManyNotifications(ids: string[]): Promise<void> {
  for (const id of ids ?? []) {
    await cancelReminderNotification(id);
  }
}
