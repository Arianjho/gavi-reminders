# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cross-platform React Native (Expo) app replicating iOS Reminders. **UI is 100% in Spanish.** Frontend-only — no backend, no auth, no cloud. All persistence via local SQLite.

The app lives entirely in `react_native_space/`. Work from that subdirectory.

## Commands

All commands run from `react_native_space/`:

```bash
yarn start           # Expo dev server (choose platform interactively)
yarn android         # Android emulator/device
yarn ios             # iOS simulator
yarn web             # Browser
```

Tests use Jest + jest-expo:

```bash
yarn jest                        # all tests
yarn jest path/to/test.tsx       # single file
```

Package manager is **Yarn 4** (Berry). Do not use `npm`.

## Architecture

### Routing (expo-router)

File-based routes under `app/`:
- `app/_layout.tsx` — root: `GestureHandlerRootView > SafeAreaProvider > ErrorBoundary > ThemeProvider > DataProvider > Stack`
- `app/tabs/` — bottom tabs: `index` (Inicio dashboard), `search` (Buscar), `settings` (Ajustes)
- `app/smart/[type].tsx` — smart lists (Today, Scheduled, All, Flagged, Done)
- `app/list/[listId]/index.tsx` + `edit.tsx` — list detail and edit
- `app/list-create.tsx`, `app/tags.tsx`
- `app/reminder/add.tsx`, `app/reminder/[reminderId]/index.tsx` + `edit.tsx`
- `app/tag/[tagName].tsx`

### Data Layer

- `services/database.ts` — single SQLite file (`gavi_reminders.db`). Tables: `List`, `Reminder`, `Tag`, `ReminderTag`, `Setting`. Seeds 3 default lists on first open. All CRUD + smart counts + full-text search live here.
- `services/notifications.ts` — expo-notifications scheduling (DATE/DAILY/WEEKLY/MONTHLY). No-op on web.
- `context/DataContext.tsx` — initializes DB, exposes `refreshToken`/`triggerRefresh()` and action wrappers (`saveNewReminder`, `editReminder`, `toggleComplete`, `removeReminder`, `removeList`) that call the DB and reschedule notifications. Screens reload with `useFocusEffect` keyed on `refreshToken`.
- `context/ThemeContext.tsx` — light/dark/system mode persisted in the `Setting` table.

### Theme

`theme/theme.ts` exports `lightColors`/`darkColors`, `SMART_COLORS`, `LIST_COLORS`, `EMOJI_OPTIONS`, `FONTS`. Primary `#007AFF`, accent `#FF9500`.

### Platform differences

- `ReminderItem` — Swipeable gesture delete on native; inline delete button on web.
- `DateTimeField` — native picker on mobile; HTML `<input type="date/time">` on web.
- `services/notifications.ts` — all calls are no-ops on web.

## Key constraints

- `metro.config.js` adds `'wasm'` to `assetExts` — required for expo-sqlite web export; do not remove.
- `babel.config.js` includes `react-native-worklets/plugin` for Reanimated v4.
- JSX text children must use **literal accented characters** (á, é, ñ…), not `\u` escapes. String-literal props may use escapes.
- Navigation packages pinned at `^7.x` in package.json to satisfy expo-doctor; keep them aligned.
- `genId()` in `database.ts` uses `expo-crypto` UUID; fallback to timestamp if crypto unavailable.
