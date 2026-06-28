# Estrategia de actualización — sin pérdida de datos

## Base de datos

expo-sqlite, archivo `gavi_reminders.db` en almacenamiento interno del dispositivo.
Tablas: `List`, `Reminder`, `Tag`, `ReminderTag`, `Setting`.

---

## Tipos de actualización

### OTA / EAS Update (solo JS/TSX)

Cuando el cambio es solo de lógica, UI o textos — sin tocar dependencias nativas ni `app.json`:

```bash
eas update --channel production
```

- El usuario descarga el bundle nuevo automáticamente.
- La BD no se toca. **Cero pérdida de datos.**

### Nuevo APK (cambio nativo)

Necesario cuando se agrega/cambia un paquete que toca código nativo, o se modifican permisos en `app.json`.

1. `eas build --platform android --profile production` → genera nuevo APK/AAB
2. El usuario **instala encima** de la versión anterior (NO desinstalar)
3. Android hace upgrade — `gavi_reminders.db` se preserva intacto

**Solo se pierden datos si el usuario desinstala manualmente antes de reinstalar.**

---

## Migraciones de base de datos

El riesgo real está en cambios de schema (nuevas tablas, nuevas columnas).

### Regla de oro

`CREATE TABLE IF NOT EXISTS` → seguro, no destruye datos existentes.
`ALTER TABLE` sin control → puede fallar si la columna ya existe.

### Patrón seguro para agregar columnas

```typescript
// En initDatabase(), después de los CREATE TABLE:
try {
  await db.execAsync(`ALTER TABLE Reminder ADD COLUMN myNewColumn TEXT DEFAULT 'valor';`);
} catch {
  // La columna ya existe en actualizaciones — ignorar el error
}
```

### Patrón para migraciones complejas (versionado)

```typescript
// Usar la tabla Setting para guardar la versión del schema
const DB_VERSION = 3;

async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM Setting WHERE key = 'db_version'`
  );
  const current = row ? parseInt(row.value) : 0;

  if (current < 2) {
    await db.execAsync(`ALTER TABLE Reminder ADD COLUMN advanceMinutes INTEGER DEFAULT 0;`);
  }
  if (current < 3) {
    await db.execAsync(`ALTER TABLE Reminder ADD COLUMN repeatDays TEXT DEFAULT NULL;`);
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO Setting (key, value) VALUES ('db_version', ?)`,
    [String(DB_VERSION)]
  );
}
```

Llamar `migrate(db)` al final de `initDatabase()`, antes de los seeds.

---

## Checklist antes de cada release

- [ ] ¿Cambié schema? → agregar bloque `try/catch ALTER TABLE` o incrementar `DB_VERSION`
- [ ] ¿Cambié dependencias nativas? → build nuevo APK, NO solo EAS Update
- [ ] ¿Solo cambié JS/UI? → EAS Update es suficiente
- [ ] Probar instalación encima de versión anterior con datos reales antes de publicar
