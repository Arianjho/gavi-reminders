import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import {
  ListItem,
  ListWithCount,
  Reminder,
  ReminderInput,
  ReminderWithMeta,
  Tag,
  TagWithCount,
  ThemePreference,
} from '../types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const nowIso = (): string => new Date().toISOString();

export const genId = (): string => {
  try {
    return Crypto.randomUUID();
  } catch {
    return `id_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  }
};

export const todayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('gavi_reminders.db');
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS List (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '\uD83D\uDCCB',
      color TEXT NOT NULL DEFAULT '#007AFF',
      position INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Reminder (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT,
      date TEXT,
      time TEXT,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      isFlagged INTEGER NOT NULL DEFAULT 0,
      recurrence TEXT,
      listId TEXT REFERENCES List(id) ON DELETE SET NULL,
      notificationId TEXT,
      completedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reminder_listId ON Reminder(listId);
    CREATE INDEX IF NOT EXISTS idx_reminder_date ON Reminder(date);
    CREATE INDEX IF NOT EXISTS idx_reminder_isCompleted ON Reminder(isCompleted);
    CREATE INDEX IF NOT EXISTS idx_reminder_isFlagged ON Reminder(isFlagged);

    CREATE TABLE IF NOT EXISTS Tag (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tag_name ON Tag(name);

    CREATE TABLE IF NOT EXISTS ReminderTag (
      reminderId TEXT NOT NULL REFERENCES Reminder(id) ON DELETE CASCADE,
      tagId TEXT NOT NULL REFERENCES Tag(id) ON DELETE CASCADE,
      PRIMARY KEY (reminderId, tagId)
    );

    CREATE INDEX IF NOT EXISTS idx_reminderTag_reminderId ON ReminderTag(reminderId);
    CREATE INDEX IF NOT EXISTS idx_reminderTag_tagId ON ReminderTag(tagId);

    CREATE TABLE IF NOT EXISTS Setting (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO Setting (key, value) VALUES ('theme', 'system');
  `);

  // Migrations — safe to re-run; errors mean column already exists
  try {
    await db.execAsync(`ALTER TABLE Reminder ADD COLUMN advanceMinutes INTEGER NOT NULL DEFAULT 0;`);
  } catch { /* already exists */ }
  try {
    await db.execAsync(`ALTER TABLE Reminder ADD COLUMN repeatDays TEXT DEFAULT NULL;`);
  } catch { /* already exists */ }

  await seedDefaultLists(db);
}

async function seedDefaultLists(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM List');
  const count = row?.c ?? 0;
  if (count > 0) return;
  const defaults = [
    { name: 'Compras', emoji: '\uD83D\uDED2', color: '#FF9500' },
    { name: 'Casa', emoji: '\uD83C\uDFE0', color: '#34C759' },
    { name: 'Viajes', emoji: '\u2708\uFE0F', color: '#007AFF' },
  ];
  for (let i = 0; i < defaults.length; i++) {
    const d = defaults[i];
    const ts = nowIso();
    await db.runAsync(
      'INSERT INTO List (id, name, emoji, color, position, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [genId(), d.name, d.emoji, d.color, i, ts, ts]
    );
  }
}

/* ---------------- Settings ---------------- */

export async function getThemePreference(): Promise<ThemePreference> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM Setting WHERE key = 'theme'"
    );
    const v = row?.value;
    if (v === 'light' || v === 'dark' || v === 'system') return v;
    return 'system';
  } catch {
    return 'system';
  }
}

export async function setThemePreference(pref: ThemePreference): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO Setting (key, value) VALUES ('theme', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [pref]
  );
}

/* ---------------- Lists ---------------- */

export async function getLists(): Promise<ListWithCount[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ListWithCount>(`
    SELECT l.*, (
      SELECT COUNT(*) FROM Reminder r WHERE r.listId = l.id AND r.isCompleted = 0
    ) as pendingCount
    FROM List l ORDER BY l.position ASC, l.createdAt ASC
  `);
  return rows ?? [];
}

export async function getListById(id: string): Promise<ListItem | null> {
  if (!id) return null;
  const db = await getDb();
  const row = await db.getFirstAsync<ListItem>('SELECT * FROM List WHERE id = ?', [id]);
  return row ?? null;
}

export async function createList(
  name: string,
  emoji: string,
  color: string
): Promise<string> {
  const db = await getDb();
  const id = genId();
  const ts = nowIso();
  const posRow = await db.getFirstAsync<{ m: number }>(
    'SELECT COALESCE(MAX(position), -1) + 1 as m FROM List'
  );
  const position = posRow?.m ?? 0;
  await db.runAsync(
    'INSERT INTO List (id, name, emoji, color, position, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name.trim(), emoji, color, position, ts, ts]
  );
  return id;
}

export async function updateList(
  id: string,
  name: string,
  emoji: string,
  color: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE List SET name = ?, emoji = ?, color = ?, updatedAt = ? WHERE id = ?',
    [name.trim(), emoji, color, nowIso(), id]
  );
}

export async function deleteList(id: string): Promise<string[]> {
  const db = await getDb();
  const reminders = await db.getAllAsync<{ notificationId: string | null }>(
    'SELECT notificationId FROM Reminder WHERE listId = ?',
    [id]
  );
  const notifIds = (reminders ?? [])
    .map((r) => r?.notificationId)
    .filter((n): n is string => !!n);
  await db.runAsync('DELETE FROM Reminder WHERE listId = ?', [id]);
  await db.runAsync('DELETE FROM List WHERE id = ?', [id]);
  return notifIds;
}

/* ---------------- Tags ---------------- */

export async function getAllTags(): Promise<TagWithCount[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TagWithCount>(`
    SELECT t.id, t.name, t.createdAt, COUNT(rt.reminderId) as count
    FROM Tag t LEFT JOIN ReminderTag rt ON t.id = rt.tagId
    GROUP BY t.id ORDER BY t.name ASC
  `);
  return rows ?? [];
}

async function getOrCreateTag(db: SQLite.SQLiteDatabase, rawName: string): Promise<string | null> {
  const name = rawName.trim().replace(/^#/, '').toLowerCase();
  if (!name) return null;
  const existing = await db.getFirstAsync<Tag>('SELECT * FROM Tag WHERE name = ?', [name]);
  if (existing?.id) return existing.id;
  const id = genId();
  await db.runAsync('INSERT INTO Tag (id, name, createdAt) VALUES (?, ?, ?)', [
    id,
    name,
    nowIso(),
  ]);
  return id;
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Tag WHERE id = ?', [id]);
}

async function getTagsForReminder(
  db: SQLite.SQLiteDatabase,
  reminderId: string
): Promise<Tag[]> {
  const rows = await db.getAllAsync<Tag>(
    'SELECT t.* FROM Tag t JOIN ReminderTag rt ON t.id = rt.tagId WHERE rt.reminderId = ? ORDER BY t.name',
    [reminderId]
  );
  return rows ?? [];
}

/* ---------------- Reminders ---------------- */

function parseRepeatDays(raw: unknown): number[] | null {
  if (!raw || typeof raw !== 'string') return null;
  try { return JSON.parse(raw) as number[]; } catch { return null; }
}

async function attachMeta(
  db: SQLite.SQLiteDatabase,
  reminders: Reminder[]
): Promise<ReminderWithMeta[]> {
  const result: ReminderWithMeta[] = [];
  for (const r of reminders ?? []) {
    if (!r) continue;
    const tags = await getTagsForReminder(db, r.id);
    let list: ListItem | null = null;
    if (r.listId) {
      list = await db.getFirstAsync<ListItem>('SELECT * FROM List WHERE id = ?', [r.listId]);
    }
    result.push({
      ...r,
      advanceMinutes: (r as any).advanceMinutes ?? 0,
      repeatDays: parseRepeatDays((r as any).repeatDays),
      tags,
      list: list ?? null,
    });
  }
  return result;
}

export async function getReminderById(id: string): Promise<ReminderWithMeta | null> {
  if (!id) return null;
  const db = await getDb();
  const row = await db.getFirstAsync<Reminder>('SELECT * FROM Reminder WHERE id = ?', [id]);
  if (!row) return null;
  const withMeta = await attachMeta(db, [row]);
  return withMeta?.[0] ?? null;
}

export async function createReminder(input: ReminderInput): Promise<string> {
  const db = await getDb();
  const id = genId();
  const ts = nowIso();
  await db.runAsync(
    `INSERT INTO Reminder (id, title, notes, date, time, isCompleted, isFlagged, recurrence, listId, notificationId, completedAt, createdAt, updatedAt, advanceMinutes, repeatDays)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, NULL, NULL, ?, ?, ?, ?)`,
    [
      id,
      input.title.trim(),
      input.notes ?? null,
      input.date ?? null,
      input.time ?? null,
      input.isFlagged ?? 0,
      input.recurrence ?? null,
      input.listId ?? null,
      ts,
      ts,
      input.advanceMinutes ?? 0,
      input.repeatDays?.length ? JSON.stringify(input.repeatDays) : null,
    ]
  );
  await syncReminderTags(db, id, input.tagNames ?? []);
  return id;
}

export async function updateReminder(id: string, input: ReminderInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE Reminder SET title = ?, notes = ?, date = ?, time = ?, isFlagged = ?, recurrence = ?, listId = ?, updatedAt = ?, advanceMinutes = ?, repeatDays = ? WHERE id = ?`,
    [
      input.title.trim(),
      input.notes ?? null,
      input.date ?? null,
      input.time ?? null,
      input.isFlagged ?? 0,
      input.recurrence ?? null,
      input.listId ?? null,
      nowIso(),
      input.advanceMinutes ?? 0,
      input.repeatDays?.length ? JSON.stringify(input.repeatDays) : null,
      id,
    ]
  );
  await syncReminderTags(db, id, input.tagNames ?? []);
}

async function syncReminderTags(
  db: SQLite.SQLiteDatabase,
  reminderId: string,
  tagNames: string[]
): Promise<void> {
  await db.runAsync('DELETE FROM ReminderTag WHERE reminderId = ?', [reminderId]);
  const seen = new Set<string>();
  for (const raw of tagNames ?? []) {
    const tagId = await getOrCreateTag(db, raw);
    if (tagId && !seen.has(tagId)) {
      seen.add(tagId);
      await db.runAsync(
        'INSERT OR IGNORE INTO ReminderTag (reminderId, tagId) VALUES (?, ?)',
        [reminderId, tagId]
      );
    }
  }
}

export async function setReminderNotificationId(
  id: string,
  notificationId: string | null
): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE Reminder SET notificationId = ? WHERE id = ?', [
    notificationId,
    id,
  ]);
}

export async function setReminderCompleted(
  id: string,
  completed: boolean
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE Reminder SET isCompleted = ?, completedAt = ?, updatedAt = ? WHERE id = ?',
    [completed ? 1 : 0, completed ? nowIso() : null, nowIso(), id]
  );
}

export async function setReminderFlagged(id: string, flagged: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE Reminder SET isFlagged = ?, updatedAt = ? WHERE id = ?', [
    flagged ? 1 : 0,
    nowIso(),
    id,
  ]);
}

export async function deleteReminder(id: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ notificationId: string | null }>(
    'SELECT notificationId FROM Reminder WHERE id = ?',
    [id]
  );
  await db.runAsync('DELETE FROM Reminder WHERE id = ?', [id]);
  return row?.notificationId ?? null;
}

/* ---------------- Counters ---------------- */

export interface SmartCounts {
  hoy: number;
  programadas: number;
  todas: number;
  marcadas: number;
}

export async function getSmartCounts(): Promise<SmartCounts> {
  const db = await getDb();
  const today = todayStr();
  const hoy = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM Reminder WHERE date = ? AND isCompleted = 0',
    [today]
  );
  const programadas = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM Reminder WHERE date IS NOT NULL AND date >= ? AND isCompleted = 0',
    [today]
  );
  const todas = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM Reminder WHERE isCompleted = 0'
  );
  const marcadas = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM Reminder WHERE isFlagged = 1 AND isCompleted = 0'
  );
  return {
    hoy: hoy?.c ?? 0,
    programadas: programadas?.c ?? 0,
    todas: todas?.c ?? 0,
    marcadas: marcadas?.c ?? 0,
  };
}

/* ---------------- Smart queries ---------------- */

export async function getRemindersBySmartType(
  type: string
): Promise<ReminderWithMeta[]> {
  const db = await getDb();
  const today = todayStr();
  let rows: Reminder[] = [];
  if (type === 'hoy') {
    rows =
      (await db.getAllAsync<Reminder>(
        'SELECT * FROM Reminder WHERE date = ? AND isCompleted = 0 ORDER BY time IS NULL, time ASC',
        [today]
      )) ?? [];
  } else if (type === 'programadas') {
    rows =
      (await db.getAllAsync<Reminder>(
        'SELECT * FROM Reminder WHERE date IS NOT NULL AND date >= ? AND isCompleted = 0 ORDER BY date ASC, time IS NULL, time ASC',
        [today]
      )) ?? [];
  } else if (type === 'marcadas') {
    rows =
      (await db.getAllAsync<Reminder>(
        'SELECT * FROM Reminder WHERE isFlagged = 1 AND isCompleted = 0 ORDER BY date IS NULL, date ASC, time ASC'
      )) ?? [];
  } else {
    // todas
    rows =
      (await db.getAllAsync<Reminder>(
        'SELECT * FROM Reminder WHERE isCompleted = 0 ORDER BY date IS NULL, date ASC, time IS NULL, time ASC, createdAt DESC'
      )) ?? [];
  }
  return attachMeta(db, rows);
}

export async function getRemindersByList(
  listId: string,
  completed: boolean
): Promise<ReminderWithMeta[]> {
  const db = await getDb();
  const rows =
    (await db.getAllAsync<Reminder>(
      'SELECT * FROM Reminder WHERE listId = ? AND isCompleted = ? ORDER BY date IS NULL, date ASC, time IS NULL, time ASC, createdAt DESC',
      [listId, completed ? 1 : 0]
    )) ?? [];
  return attachMeta(db, rows);
}

export async function getRemindersByTag(tagName: string): Promise<ReminderWithMeta[]> {
  const db = await getDb();
  const name = tagName.trim().replace(/^#/, '').toLowerCase();
  const rows =
    (await db.getAllAsync<Reminder>(
      `SELECT r.* FROM Reminder r
       JOIN ReminderTag rt ON r.id = rt.reminderId
       JOIN Tag t ON t.id = rt.tagId
       WHERE t.name = ? AND r.isCompleted = 0
       ORDER BY r.date IS NULL, r.date ASC, r.time ASC`,
      [name]
    )) ?? [];
  return attachMeta(db, rows);
}

export interface SearchFilters {
  query: string;
  status: 'all' | 'pending' | 'completed';
  listId: string | null;
  tagName: string | null;
}

export async function searchReminders(
  filters: SearchFilters
): Promise<ReminderWithMeta[]> {
  const db = await getDb();
  const q = `%${(filters.query ?? '').trim()}%`;
  const clauses: string[] = ['(r.title LIKE ? OR IFNULL(r.notes, \'\') LIKE ?)'];
  const params: (string | number)[] = [q, q];

  if (filters.status === 'pending') clauses.push('r.isCompleted = 0');
  else if (filters.status === 'completed') clauses.push('r.isCompleted = 1');

  if (filters.listId) {
    clauses.push('r.listId = ?');
    params.push(filters.listId);
  }

  let join = '';
  if (filters.tagName) {
    join =
      ' JOIN ReminderTag rt ON r.id = rt.reminderId JOIN Tag t ON t.id = rt.tagId';
    clauses.push('t.name = ?');
    params.push(filters.tagName.trim().replace(/^#/, '').toLowerCase());
  }

  const sql = `SELECT DISTINCT r.* FROM Reminder r${join} WHERE ${clauses.join(
    ' AND '
  )} ORDER BY r.isCompleted ASC, r.date IS NULL, r.date ASC, r.time ASC, r.createdAt DESC`;
  const rows = (await db.getAllAsync<Reminder>(sql, params)) ?? [];
  return attachMeta(db, rows);
}
