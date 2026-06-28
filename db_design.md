# Gavi Reminders — Local SQLite Schema

All tables are created locally via `expo-sqlite`. UUIDs are generated client-side (e.g., `crypto.randomUUID()` or `uuid` library). Timestamps are ISO8601 strings.

---

## Tables

### List

| Column    | Type    | Constraints                        |
|-----------|---------|------------------------------------|
| id        | TEXT    | PK, UUID, generated client-side    |
| name      | TEXT    | NOT NULL                           |
| emoji     | TEXT    | NOT NULL, default '📋'             |
| color     | TEXT    | NOT NULL, default '#007AFF' (hex)  |
| position  | INTEGER | NOT NULL, default 0 (for ordering) |
| createdAt | TEXT    | NOT NULL, ISO8601                  |
| updatedAt | TEXT    | NOT NULL, ISO8601                  |

---

### Reminder

| Column      | Type    | Constraints                                                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| id          | TEXT    | PK, UUID                                                                    |
| title       | TEXT    | NOT NULL                                                                    |
| notes       | TEXT    | Nullable                                                                    |
| date        | TEXT    | Nullable, ISO8601 date (YYYY-MM-DD)                                         |
| time        | TEXT    | Nullable, HH:mm format                                                     |
| isCompleted | INTEGER | NOT NULL, default 0 (boolean 0/1)                                           |
| isFlagged   | INTEGER | NOT NULL, default 0 (boolean 0/1)                                           |
| recurrence  | TEXT    | Nullable, one of: 'diario', 'semanal', 'mensual'                           |
| listId      | TEXT    | Nullable, FK → List.id ON DELETE SET NULL                                   |
| notificationId | TEXT | Nullable, stores expo-notifications scheduled notification identifier       |
| completedAt | TEXT    | Nullable, ISO8601 (set when completed)                                      |
| createdAt   | TEXT    | NOT NULL, ISO8601                                                           |
| updatedAt   | TEXT    | NOT NULL, ISO8601                                                           |

**Indexes**:
- `idx_reminder_listId` ON Reminder(listId)
- `idx_reminder_date` ON Reminder(date)
- `idx_reminder_isCompleted` ON Reminder(isCompleted)
- `idx_reminder_isFlagged` ON Reminder(isFlagged)

---

### Tag

| Column    | Type | Constraints                     |
|-----------|------|---------------------------------|
| id        | TEXT | PK, UUID                        |
| name      | TEXT | NOT NULL, UNIQUE (lowercase)    |
| createdAt | TEXT | NOT NULL, ISO8601               |

**Index**:
- `idx_tag_name` ON Tag(name)

---

### ReminderTag (join table)

| Column     | Type | Constraints                                    |
|------------|------|------------------------------------------------|
| reminderId | TEXT | NOT NULL, FK → Reminder.id ON DELETE CASCADE   |
| tagId      | TEXT | NOT NULL, FK → Tag.id ON DELETE CASCADE         |

**Primary Key**: (reminderId, tagId) — composite PK.

**Indexes**:
- `idx_reminderTag_reminderId` ON ReminderTag(reminderId)
- `idx_reminderTag_tagId` ON ReminderTag(tagId)

---

### Setting

| Column | Type | Constraints                                          |
|--------|------|------------------------------------------------------|
| key    | TEXT | PK (e.g., 'theme')                                  |
| value  | TEXT | NOT NULL (e.g., 'light', 'dark', 'system')           |

Pre-seeded row: `{ key: 'theme', value: 'system' }`

---

## Initialization SQL

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS List (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📋',
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
  recurrence TEXT CHECK(recurrence IN ('diario', 'semanal', 'mensual') OR recurrence IS NULL),
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
```

---

## Key Queries (reference for development agent)

### Dashboard counters
- **Hoy**: `SELECT COUNT(*) FROM Reminder WHERE date = ? AND isCompleted = 0` (today's date)
- **Programadas**: `SELECT COUNT(*) FROM Reminder WHERE date IS NOT NULL AND date >= ? AND isCompleted = 0` (today's date)
- **Todas**: `SELECT COUNT(*) FROM Reminder WHERE isCompleted = 0`
- **Marcadas**: `SELECT COUNT(*) FROM Reminder WHERE isFlagged = 1 AND isCompleted = 0`
- **List pending count**: `SELECT COUNT(*) FROM Reminder WHERE listId = ? AND isCompleted = 0`

### Hoy view with time periods
- Mañana: `SELECT * FROM Reminder WHERE date = ? AND time >= '06:00' AND time < '12:00' AND isCompleted = 0 ORDER BY time`
- Tarde: `SELECT * FROM Reminder WHERE date = ? AND time >= '12:00' AND time < '18:00' AND isCompleted = 0 ORDER BY time`
- Noche: `SELECT * FROM Reminder WHERE date = ? AND time >= '18:00' AND time < '24:00' AND isCompleted = 0 ORDER BY time`
- No time: `SELECT * FROM Reminder WHERE date = ? AND time IS NULL AND isCompleted = 0`

### Tags for a reminder
- `SELECT t.* FROM Tag t JOIN ReminderTag rt ON t.id = rt.tagId WHERE rt.reminderId = ?`

### Reminders by tag
- `SELECT r.* FROM Reminder r JOIN ReminderTag rt ON r.id = rt.reminderId JOIN Tag t ON t.id = rt.tagId WHERE t.name = ? AND r.isCompleted = 0`

### Search
- `SELECT * FROM Reminder WHERE (title LIKE ? OR notes LIKE ?) AND (isCompleted = ? OR ? IS NULL)` with additional joins for list/tag filters

### All tags with counts
- `SELECT t.id, t.name, COUNT(rt.reminderId) as count FROM Tag t LEFT JOIN ReminderTag rt ON t.id = rt.tagId GROUP BY t.id ORDER BY t.name`
