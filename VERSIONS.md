# VERSIONS — Gavi Reminders

Historial de cambios por versión. Actualizar al final de cada sesión de trabajo.

---

## v1.1.0 — 2026-06-28

**Features nuevas**

- **Avisar antes**: al crear/editar un recordatorio con hora activa, nueva fila "Avisar antes" con opciones 5 / 10 / 15 / 30 min / 1 hora / Personalizado (campo digitable). Solo visible cuando la hora está habilitada.
- **Repetición por días de semana**: nueva opción "Días de la semana" en el picker de Repetir. Muestra chips circulares L M X J V S D para selección múltiple. Cada día seleccionado programa una notificación WEEKLY independiente.
- **Interdiario**: nueva opción de recurrencia que dispara cada 48 horas via `TIME_INTERVAL`.

**Archivos modificados**
- `types/index.ts` — `Recurrence` extendido con `'interdiario' | 'semanal_dias'`; campos `advanceMinutes: number` y `repeatDays: number[] | null` en `Reminder` y `ReminderInput`
- `utils/format.ts` — `recurrenceLabel` actualizado; nueva función `advanceLabel(minutes)`
- `services/database.ts` — migración `try/catch ALTER TABLE` para `advanceMinutes` y `repeatDays`; CRUD actualizado; `attachMeta` parsea `repeatDays` de JSON
- `services/notifications.ts` — `buildTriggerDate` resta `advanceMinutes`; soporte para `interdiario` (TIME_INTERVAL 48h) y `semanal_dias` (múltiples WEEKLY, IDs como JSON array); `cancelReminderNotification` cancela arrays de IDs
- `context/DataContext.tsx` — todas las llamadas a `scheduleReminderNotification` pasan `advanceMinutes` y `repeatDays`
- `components/ReminderForm.tsx` — UI completa para ambas features (OptionSheet de aviso + chips de días)

**Infraestructura**
- Git inicializado y conectado a `github.com/Arianjho/gavi-reminders`
- `eas.json` creado (profiles: development, preview=APK, production=AAB)
- `.gitignore` configurado (excluye `node_modules/`, `android/`, `*.keystore`, `.yarn/install-state.gz`, `releases/`)
- `gavi-reminders.keystore` generado para firma de APKs (NO commitear)
- `docs/update-strategy.md` creado — guía de migraciones de BD y estrategia de updates sin pérdida de datos
- `app.json`: versión bumpeada a `1.1.0`, `versionCode 2`

**Correcciones**
- Todos los escapes Unicode (`ñ`, `á`, etc.) reemplazados por caracteres literales en `.ts`/`.tsx`

**Notas de build**
- Build local en Windows falla por MAX_PATH (260 chars) en rutas de CMake/ninja del NDK — usar **EAS Build** (`eas login` + `eas build --platform android --profile preview`) para generar APK

---

## v1.0.0 — estado inicial (pre-sesión)

**Stack**: Expo ~54, React Native 0.81.5, expo-router ~6, expo-sqlite ~16, TypeScript ~5.9  
**Paquete**: `yarn@4.13.0` (Berry, `nodeLinker: node-modules`)

**Funcionalidades presentes**
- CRUD completo de recordatorios: título, notas, fecha, hora, recurrencia (Diario / Semanal / Mensual), lista, etiquetas, marcado como importante
- Listas personalizadas (emoji + color); seeds: Compras, Casa, Viajes
- Smart lists: Hoy, Programadas, Todas, Marcadas
- Búsqueda full-text por palabra, lista o etiqueta
- Notificaciones locales via `expo-notifications` (DATE / DAILY / WEEKLY / MONTHLY)
- Tema claro/oscuro/sistema persistido en SQLite (tabla Setting)
- Soporte web (metro config con `wasm` para expo-sqlite)

**Arquitectura**
- Rutas: `app/` con expo-router; tabs en `app/tabs/` (Inicio, Buscar, Ajustes)
- BD: SQLite `gavi_reminders.db` — tablas List, Reminder, Tag, ReminderTag, Setting
- Contextos: `DataContext` (CRUD + notificaciones), `ThemeContext` (tema)
- Fuente: Nunito (400/600/700/800) via `@expo-google-fonts/nunito`
- Tema: `theme/theme.ts` — primary `#007AFF`, accent `#FF9500`
