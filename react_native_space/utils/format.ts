import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Recurrence } from '../types';

export function formatDateLong(date: string | null): string {
  if (!date) return '';
  try {
    const d = parseISO(date);
    return format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return date ?? '';
  }
}

export function formatDateShort(date: string | null): string {
  if (!date) return '';
  try {
    const d = parseISO(date);
    return format(d, "d MMM yyyy", { locale: es });
  } catch {
    return date ?? '';
  }
}

export function formatDateRelative(date: string | null): string {
  if (!date) return '';
  try {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrow = new Date(today.getTime() + 86400000);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
    if (date === todayStr) return 'Hoy';
    if (date === tomorrowStr) return 'Mañana';
    return formatDateShort(date);
  } catch {
    return date ?? '';
  }
}

export function formatTime(time: string | null): string {
  if (!time) return '';
  return time;
}

export function recurrenceLabel(rec: Recurrence | null): string {
  switch (rec) {
    case 'diario': return 'Diario';
    case 'interdiario': return 'Interdiario';
    case 'semanal': return 'Semanal';
    case 'semanal_dias': return 'Días de la semana';
    case 'mensual': return 'Mensual';
    default: return 'Nunca';
  }
}

export function advanceLabel(minutes: number): string {
  if (!minutes) return 'Ninguno';
  if (minutes === 60) return '1 hora antes';
  return `${minutes} min antes`;
}

export function buildSubtitle(
  date: string | null,
  time: string | null
): string {
  const parts: string[] = [];
  if (date) parts.push(formatDateRelative(date));
  if (time) parts.push(time);
  return parts.join('  ·  ');
}
