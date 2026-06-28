# Gavi Reminders — UX Specification

All UI text is in **Spanish**. No English strings anywhere in the app.

---

## File Structure (expo-router)

```
app/
  _layout.tsx              # Root layout: ThemeProvider, SQLite init, wraps <Stack>
  tabs/
    _layout.tsx            # <Tabs> with 3 tabs: Inicio, Buscar, Ajustes
    index.tsx              # Dashboard (Inicio tab)
    search.tsx             # Buscar tab
    settings.tsx           # Ajustes tab
  smart/
    [type].tsx             # Smart view: type = "hoy" | "programadas" | "todas" | "marcadas"
  list/
    [listId]/
      index.tsx            # List detail — reminders in that list
      edit.tsx             # Edit list (name, emoji, color)
  tag/
    [tagName].tsx          # Reminders filtered by tag
  reminder/
    add.tsx                # Add/create reminder (full-screen modal-style)
    [reminderId]/
      index.tsx            # Reminder detail view
      edit.tsx             # Edit reminder
  tags.tsx                 # All tags overview
  list-create.tsx          # Create new list
```

---

<screens>

### 1. Dashboard — `app/tabs/index.tsx`
**Purpose**: Main hub replicating iOS Reminders home.

**Layout (top → bottom)**:
- Header: "Gavi Reminders" display title, no back button.
- **Smart Views Grid** (2×2 cards):
  - "Hoy" — calendar icon, blue, counter of today's pending reminders
  - "Programadas" — clock icon, red, counter of reminders with future dates
  - "Todas" — tray icon, dark gray, counter of all pending reminders
  - "Marcadas" — star icon, orange, counter of flagged reminders
  Each card: rounded 16px, tinted background matching icon color at 12% opacity, icon + label + counter. Tap → push `smart/[type]`.
- **Section: "Mis Listas"** — section header with "Mis Listas" label.
  - Vertical list of custom lists. Each row: emoji circle (list color background) + list name + pending count badge (right-aligned) + chevron. Tap → push `list/[listId]`.
  - Bottom of section: "+ Nueva Lista" text button → push `list-create`.
- **Section: "Etiquetas"** — section header "Etiquetas".
  - Horizontal scrollable chip row of existing tags (# prefix, muted pill style). Tap chip → push `tag/[tagName]`. If >5 tags, last chip is "Ver todas" → push `tags`.
- **FAB**: Floating "+" button, bottom-right, gradient fill [primary, accent]. Tap → push `reminder/add`.

### 2. Smart View — `app/smart/[type].tsx`
**Purpose**: Filtered reminder lists for Hoy, Programadas, Todas, Marcadas.

**Layout**:
- Header: title matching type ("Hoy", "Programadas", "Todas", "Marcadas"), back arrow.
- **"Hoy" variant only**: reminders grouped into 3 collapsible sections:
  - "Mañana (6:00–12:00)" — reminders with time 06:00–11:59
  - "Tarde (12:00–18:00)" — reminders with time 12:00–17:59
  - "Noche (18:00–24:00)" — reminders with time 18:00–23:59
  Each reminder row shows: checkbox (left), title, time (e.g. "09:30"), recurring icon if applicable, flag star if flagged.
- **Other variants**: flat list of matching reminders, each row: checkbox, title, date/time subtitle, flag star, list color dot.
- Checkbox tap → smooth scale+fade completion animation (circle fills with checkmark, row fades to 50% opacity after 1s delay, then hides). Haptic on complete.
- Swipe left on row → red "Eliminar" action → confirm deletion.
- Tap row → push `reminder/[reminderId]`.
- Empty state: illustration + "No hay recordatorios" message.

### 3. List Detail — `app/list/[listId]/index.tsx`
**Purpose**: Show all reminders belonging to a specific list.

**Layout**:
- Header: list emoji + list name, back arrow, overflow menu (⋯) with "Editar Lista" and "Eliminar Lista".
- Segmented control: "Pendientes" | "Completados".
- Reminder rows identical to Smart View rows.
- FAB "+" to add reminder pre-assigned to this list.
- "Eliminar Lista" shows confirmation bottom sheet: "¿Eliminar lista y todos sus recordatorios?" with "Cancelar" / "Eliminar" buttons.

### 4. Edit List — `app/list/[listId]/edit.tsx`
**Purpose**: Edit list name, emoji, color.

**Layout**:
- Header: "Editar Lista", back arrow, "Guardar" button (top-right).
- Preview circle showing selected emoji on selected color background.
- Text input: "Nombre de la lista" (floating label).
- Emoji picker: grid of ~30 common emojis (pre-curated: 📋📌🏠💼🎯🛒💡📚🎵🏋️ etc.).
- Color picker: 12 color circles in a row (iOS palette: red, orange, yellow, green, teal, blue, indigo, purple, pink, brown, gray, dark gray).
- "Guardar" validates name is non-empty, saves, pops back.

### 5. Create List — `app/list-create.tsx`
**Purpose**: Create a new custom list.

**Layout**: Identical to Edit List but header says "Nueva Lista", button says "Crear".

### 6. Add Reminder — `app/reminder/add.tsx`
**Purpose**: Create a new reminder.

**Layout**:
- Header: "Nuevo Recordatorio", "Cancelar" (left), "Añadir" (right, disabled until title filled).
- **Title input**: "Título" floating label, large font.
- **Notes input**: "Notas" floating label, multiline, smaller font.
- **Fecha y Hora section**:
  - Toggle "Fecha" — when on, date picker appears (default today).
  - Toggle "Hora" — when on, time picker appears (default current hour rounded up).
- **Repetir**: selector row → bottom sheet with options: "Nunca", "Diario", "Semanal", "Mensual". Shows selected value.
- **Lista**: selector row → bottom sheet listing all custom lists + "Sin lista". Shows selected list emoji+name.
- **Marcado**: toggle row with star icon — "Marcar como importante".
- **Etiquetas**: tag input field. Type "#" to start, comma or space to confirm tag. Shows added tags as removable chips below input. Autocomplete from existing tags.
- "Añadir" saves reminder, schedules local notification if date/time set, pops back.

### 7. Reminder Detail — `app/reminder/[reminderId]/index.tsx`
**Purpose**: View full reminder details.

**Layout**:
- Header: back arrow, "Editar" button (top-right) → push `edit`.
- Card with: title (large), completion status checkbox, flag indicator.
- Info rows: 📅 date, 🕐 time, 🔁 recurrence, 📋 list name (tappable → list detail), 🏷 tags as chips.
- Notes section (if present).
- Bottom: "Eliminar Recordatorio" destructive button → confirmation → delete + pop.

### 8. Edit Reminder — `app/reminder/[reminderId]/edit.tsx`
**Purpose**: Edit existing reminder. Same layout as Add Reminder, pre-filled with current values. Header: "Editar Recordatorio", button: "Guardar".

### 9. All Tags — `app/tags.tsx`
**Purpose**: Browse all tags.

**Layout**:
- Header: "Etiquetas", back arrow.
- List of tags, each row: "#tagname" + count of reminders using it + chevron.
- Tap → push `tag/[tagName]`.
- Swipe left to delete tag (removes tag from all reminders, does not delete reminders).
- Empty state: "No hay etiquetas".

### 10. Tag Detail — `app/tag/[tagName].tsx`
**Purpose**: Show reminders with a specific tag.

**Layout**:
- Header: "#tagname", back arrow.
- Reminder list (same row style as Smart View).

### 11. Search — `app/tabs/search.tsx`
**Purpose**: Search and filter reminders.

**Layout**:
- Search bar at top: placeholder "Buscar recordatorios...".
- Filter chips below search bar: "Pendientes" / "Completados" (toggle), list filter dropdown, tag filter dropdown.
- Results list: reminder rows matching query + filters.
- Empty/initial state: "Escribe para buscar" with search illustration.

### 12. Settings — `app/tabs/settings.tsx`
**Purpose**: App settings.

**Layout**:
- Header: "Ajustes".
- **Apariencia** section:
  - "Tema" row with segmented control: "Claro" / "Oscuro" / "Sistema".
- **Datos** section:
  - "Exportar recordatorios" (future, disabled, shows "Próximamente").
- **Acerca de** section:
  - "Versión" — "1.0.0".
  - "Desarrollado por Gavi".

</screens>

<navigation>

- **Root**: `_layout.tsx` wraps everything in `ThemeProvider` (Context), initializes SQLite database on mount. Returns `<Stack screenOptions={{ headerShown: false }}>` containing all routes.
- **Tabs**: 3 tabs — "Inicio" (home icon), "Buscar" (search icon), "Ajustes" (gear icon).
- **No authentication** — app launches directly into tabs.
- Stack pushes from tabs: Dashboard → smart/[type], list/[listId], tags, tag/[tagName], reminder/add, reminder/[reminderId].
- All non-tab screens use stack push with slide-from-right transition.
- Back navigation via header back arrow or swipe-back gesture.

</navigation>

<design_direction>

- **Theme**: Light mode default, dark mode toggle. Light: warm off-white backgrounds (#F5F5F0 base, #FFFFFF cards). Dark: dark grays (#0A0A0A base, #1A1A1A cards).
- **Color palette**: iOS Reminders-inspired. Primary: **#007AFF** (iOS blue). Accent: **#FF9500** (iOS orange). Smart view colors: Hoy=#007AFF, Programadas=#FF3B30, Todas=#8E8E93, Marcadas=#FF9500.
- **List colors palette** (12 options): #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #A2845E, #8E8E93, #636366.
- **Typography**: Google Fonts — Display/Heading: "Nunito" (bold, 700). Body: "Nunito" (regular, 400). Display: 32px, H1: 24px, H2: 20px, Body: 16px, Caption: 13px.
- **Backgrounds**: Flat with subtle depth — cards elevated with shadow (light) or lighter surface (dark). No heavy gradients.
- **Icons**: @expo/vector-icons (Ionicons set) for consistency with iOS feel.

</design_direction>

<animation_and_motion>

- **Completion animation**: Checkbox circle scales from 1→1.2→1 with spring (damping 12), fills with checkmark icon, row text gets strikethrough + opacity 0.5 after 800ms delay. Haptic impact (medium) on tap.
- **Swipe to delete**: Row slides left revealing red background + trash icon. Release past threshold → row height animates to 0 + fade out.
- **FAB press**: Scale 0.95 with spring + light haptic.
- **List/card press**: Scale 0.98 with spring.
- **Screen transitions**: Default expo-router stack slide.
- **Smart view counters**: Number animates (count up) on dashboard mount.
- **Tag chips**: Fade-in when added, scale-out when removed.
- **Loading**: Skeleton shimmer for initial SQLite load (brief).
- **Bottom sheets**: Snap points with backdrop blur, drag handle.
- **Respect reduced motion**: Check `AccessibilityInfo` and disable animations.

</animation_and_motion>

<component_standards>

- **Buttons**: Solid fill for primary actions ("Añadir", "Guardar"), text buttons for secondary ("Cancelar"). Press animation scale 0.97.
- **Inputs**: Floating labels, focus border color = primary blue, error state with red border + shake animation. Validation: title required for reminders, name required for lists.
- **Cards**: Smart view cards rounded 16px, subtle shadow (light) or elevated surface (dark).
- **Lists**: FlatList for reminder lists (datasets are local/small, FlashList unnecessary). Staggered fade-in on mount.
- **Empty states**: Centered illustration (simple SVG/icon) + descriptive text + optional action button.
- **Spacing**: 8pt grid. Padding: screen 16px, card internal 12px. Border radius: cards 16px, chips 20px, buttons 12px, inputs 12px.
- **Accessibility**: All interactive elements have `accessibilityLabel` in Spanish. Touch targets 44pt minimum. Contrast ≥ 4.5:1.

</component_standards>
