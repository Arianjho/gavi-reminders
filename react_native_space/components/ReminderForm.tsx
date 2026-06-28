import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { DateTimeField } from './DateTimeField';
import { OptionSheet, SheetOption } from './OptionSheet';
import { TagChip } from './TagChip';
import { FONTS } from '../theme/theme';
import { ListItem, Recurrence, ReminderInput, Tag } from '../types';
import { getLists, getAllTags } from '../services/database';
import { recurrenceLabel, advanceLabel } from '../utils/format';
import { hapticLight } from '../utils/haptics';

interface Props {
  initial?: Partial<ReminderInput>;
  presetListId?: string | null;
  onValidChange: (valid: boolean) => void;
  formRef: React.MutableRefObject<(() => ReminderInput) | null>;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const WEEK_DAYS = [
  { label: 'L', value: 1 },
  { label: 'M', value: 2 },
  { label: 'X', value: 3 },
  { label: 'J', value: 4 },
  { label: 'V', value: 5 },
  { label: 'S', value: 6 },
  { label: 'D', value: 7 },
];

const ADVANCE_OPTIONS: SheetOption[] = [
  { label: 'Ninguno', value: '0' },
  { label: '5 min antes', value: '5' },
  { label: '10 min antes', value: '10' },
  { label: '15 min antes', value: '15' },
  { label: '30 min antes', value: '30' },
  { label: '1 hora antes', value: '60' },
  { label: 'Personalizado...', value: 'custom' },
];

export const ReminderForm: React.FC<Props> = ({
  initial,
  presetListId,
  onValidChange,
  formRef,
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [dateEnabled, setDateEnabled] = useState(!!initial?.date);
  const [timeEnabled, setTimeEnabled] = useState(!!initial?.time);
  const [dateObj, setDateObj] = useState<Date>(() => {
    if (initial?.date) {
      const [y, m, d] = initial.date.split('-').map((n) => parseInt(n, 10));
      return new Date(y, (m || 1) - 1, d || 1);
    }
    return new Date();
  });
  const [timeObj, setTimeObj] = useState<Date>(() => {
    const base = new Date();
    if (initial?.time) {
      const [hh, mm] = initial.time.split(':').map((n) => parseInt(n, 10));
      base.setHours(hh || 9, mm || 0, 0, 0);
    } else {
      base.setHours(base.getHours() + 1, 0, 0, 0);
    }
    return base;
  });
  const [recurrence, setRecurrence] = useState<Recurrence | null>(
    initial?.recurrence ?? null
  );
  const [repeatDays, setRepeatDays] = useState<number[]>(
    initial?.repeatDays ?? []
  );
  const [advanceMinutes, setAdvanceMinutes] = useState<number>(
    initial?.advanceMinutes ?? 0
  );
  const [customAdvance, setCustomAdvance] = useState('');
  const [showCustomAdvance, setShowCustomAdvance] = useState(false);
  const [listId, setListId] = useState<string | null>(
    initial?.listId ?? presetListId ?? null
  );
  const [flagged, setFlagged] = useState((initial?.isFlagged ?? 0) === 1);
  const [tagNames, setTagNames] = useState<string[]>(initial?.tagNames ?? []);
  const [tagInput, setTagInput] = useState('');

  const [lists, setLists] = useState<ListItem[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showRecSheet, setShowRecSheet] = useState(false);
  const [showListSheet, setShowListSheet] = useState(false);
  const [showAdvanceSheet, setShowAdvanceSheet] = useState(false);

  useEffect(() => {
    (async () => {
      setLists(await getLists());
      setAllTags(await getAllTags());
    })();
  }, []);

  useEffect(() => {
    onValidChange(title.trim().length > 0);
  }, [title, onValidChange]);

  const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(
    dateObj.getDate()
  )}`;
  const timeStr = `${pad(timeObj.getHours())}:${pad(timeObj.getMinutes())}`;

  formRef.current = (): ReminderInput => ({
    title: title.trim(),
    notes: notes.trim() ? notes.trim() : null,
    date: dateEnabled ? dateStr : null,
    time: dateEnabled && timeEnabled ? timeStr : null,
    isFlagged: flagged ? 1 : 0,
    recurrence,
    listId,
    tagNames,
    advanceMinutes: dateEnabled && timeEnabled ? advanceMinutes : 0,
    repeatDays: recurrence === 'semanal_dias' ? repeatDays : null,
  });

  const selectedList = useMemo(
    () => lists.find((l) => l.id === listId) ?? null,
    [lists, listId]
  );

  const commitTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tagNames.includes(clean)) {
      setTagNames([...tagNames, clean]);
    }
    setTagInput('');
  };

  const suggestions = allTags
    .map((t) => t.name)
    .filter(
      (n) =>
        tagInput.trim().length > 0 &&
        n.includes(tagInput.trim().replace(/^#/, '').toLowerCase()) &&
        !tagNames.includes(n)
    )
    .slice(0, 5);

  const recOptions: SheetOption[] = [
    { label: 'Nunca', value: 'nunca' },
    { label: 'Diario', value: 'diario' },
    { label: 'Interdiario', value: 'interdiario' },
    { label: 'Días de la semana', value: 'semanal_dias' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' },
  ];

  const listOptions: SheetOption[] = [
    { label: 'Sin lista', value: 'none' },
    ...lists.map((l) => ({ label: l.name, value: l.id, emoji: l.emoji, color: l.color })),
  ];

  const handleAdvanceSelect = (v: string) => {
    if (v === 'custom') {
      setShowCustomAdvance(true);
      setCustomAdvance(advanceMinutes > 0 ? String(advanceMinutes) : '');
    } else {
      setAdvanceMinutes(parseInt(v, 10));
      setShowCustomAdvance(false);
    }
  };

  const commitCustomAdvance = () => {
    const n = parseInt(customAdvance, 10);
    if (!isNaN(n) && n > 0) setAdvanceMinutes(n);
    setShowCustomAdvance(false);
  };

  const toggleRepeatDay = (day: number) => {
    hapticLight();
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.colors.inputBg, color: theme.colors.text, fontFamily: FONTS.regular },
  ];

  const rowStyle = [styles.row, { borderBottomColor: theme.colors.separator }];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Título"
          placeholderTextColor={theme.colors.textTertiary}
          style={[inputStyle, styles.titleInput]}
          accessibilityLabel="Título del recordatorio"
        />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notas"
          placeholderTextColor={theme.colors.textTertiary}
          style={[inputStyle, styles.notesInput]}
          multiline
          accessibilityLabel="Notas"
        />

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          {/* Fecha */}
          <View style={rowStyle}>
            <View style={styles.rowLabel}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.danger} />
              <ThemedText variant="body" style={styles.rowText}>Fecha</ThemedText>
            </View>
            <Switch
              value={dateEnabled}
              onValueChange={(v) => {
                hapticLight();
                setDateEnabled(v);
                if (!v) { setTimeEnabled(false); setAdvanceMinutes(0); setShowCustomAdvance(false); }
              }}
            />
          </View>
          {dateEnabled ? (
            <View style={[styles.pickerRow, { borderBottomColor: theme.colors.separator }]}>
              <DateTimeField mode="date" value={dateObj} onChange={setDateObj} display={dateStr} />
            </View>
          ) : null}

          {/* Hora */}
          <View style={rowStyle}>
            <View style={styles.rowLabel}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <ThemedText variant="body" style={styles.rowText}>Hora</ThemedText>
            </View>
            <Switch
              value={timeEnabled}
              disabled={!dateEnabled}
              onValueChange={(v) => {
                hapticLight();
                setTimeEnabled(v);
                if (!v) { setAdvanceMinutes(0); setShowCustomAdvance(false); }
              }}
            />
          </View>
          {dateEnabled && timeEnabled ? (
            <View style={[styles.pickerRow, { borderBottomColor: theme.colors.separator }]}>
              <DateTimeField mode="time" value={timeObj} onChange={setTimeObj} display={timeStr} />
            </View>
          ) : null}

          {/* Avisar antes — solo visible cuando hora está activa */}
          {dateEnabled && timeEnabled ? (
            <>
              <Pressable style={rowStyle} onPress={() => { hapticLight(); setShowAdvanceSheet(true); }}>
                <View style={styles.rowLabel}>
                  <Ionicons name="notifications-outline" size={20} color={theme.colors.accent} />
                  <ThemedText variant="body" style={styles.rowText}>Avisar antes</ThemedText>
                </View>
                <View style={styles.rowValue}>
                  <ThemedText variant="body" color={theme.colors.textTertiary}>
                    {advanceLabel(advanceMinutes)}
                  </ThemedText>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                </View>
              </Pressable>
              {showCustomAdvance ? (
                <View style={[styles.pickerRow, { borderBottomColor: theme.colors.separator }]}>
                  <TextInput
                    value={customAdvance}
                    onChangeText={setCustomAdvance}
                    onBlur={commitCustomAdvance}
                    onSubmitEditing={commitCustomAdvance}
                    placeholder="Minutos"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="number-pad"
                    style={[inputStyle, { flex: 1 }]}
                    autoFocus
                  />
                </View>
              ) : null}
            </>
          ) : null}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          {/* Repetir */}
          <Pressable style={rowStyle} onPress={() => setShowRecSheet(true)}>
            <View style={styles.rowLabel}>
              <Ionicons name="repeat" size={20} color={theme.colors.success} />
              <ThemedText variant="body" style={styles.rowText}>Repetir</ThemedText>
            </View>
            <View style={styles.rowValue}>
              <ThemedText variant="body" color={theme.colors.textTertiary}>
                {recurrenceLabel(recurrence)}
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </View>
          </Pressable>

          {/* Selector de días — visible solo cuando recurrence = semanal_dias */}
          {recurrence === 'semanal_dias' ? (
            <View style={[styles.daysRow, { borderBottomColor: theme.colors.separator }]}>
              {WEEK_DAYS.map((d) => {
                const active = repeatDays.includes(d.value);
                return (
                  <Pressable
                    key={d.value}
                    onPress={() => toggleRepeatDay(d.value)}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: active ? theme.colors.primary : theme.colors.inputBg,
                        borderColor: active ? theme.colors.primary : theme.colors.separator,
                      },
                    ]}
                  >
                    <ThemedText
                      variant="captionBold"
                      color={active ? '#fff' : theme.colors.textSecondary}
                    >
                      {d.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {/* Lista */}
          <Pressable style={rowStyle} onPress={() => setShowListSheet(true)}>
            <View style={styles.rowLabel}>
              <Ionicons name="list" size={20} color={theme.colors.accent} />
              <ThemedText variant="body" style={styles.rowText}>Lista</ThemedText>
            </View>
            <View style={styles.rowValue}>
              <ThemedText variant="body" color={theme.colors.textTertiary}>
                {selectedList ? `${selectedList.emoji} ${selectedList.name}` : 'Sin lista'}
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </View>
          </Pressable>

          {/* Marcar */}
          <View style={[styles.row, styles.lastRow]}>
            <View style={styles.rowLabel}>
              <Ionicons name="flag" size={20} color={theme.colors.accent} />
              <ThemedText variant="body" style={styles.rowText}>Marcar como importante</ThemedText>
            </View>
            <Switch
              value={flagged}
              onValueChange={(v) => {
                hapticLight();
                setFlagged(v);
              }}
            />
          </View>
        </View>

        <ThemedText variant="captionBold" color={theme.colors.textTertiary} style={styles.section}>
          ETIQUETAS
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, padding: 12 }]}>
          <TextInput
            value={tagInput}
            onChangeText={(t) => {
              if (t.endsWith(' ') || t.endsWith(',')) {
                setTagInput(t);
                commitTag();
              } else {
                setTagInput(t);
              }
            }}
            onSubmitEditing={commitTag}
            placeholder="#etiqueta"
            placeholderTextColor={theme.colors.textTertiary}
            style={[inputStyle]}
            autoCapitalize="none"
            accessibilityLabel="Añadir etiqueta"
          />
          {suggestions.length > 0 ? (
            <View style={styles.suggestRow}>
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    if (!tagNames.includes(s)) setTagNames([...tagNames, s]);
                    setTagInput('');
                  }}
                  style={[styles.suggestChip, { backgroundColor: theme.colors.inputBg }]}
                >
                  <ThemedText variant="caption" color={theme.colors.primary}>#{s}</ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}
          {tagNames.length > 0 ? (
            <View style={styles.tagWrap}>
              {tagNames.map((t) => (
                <TagChip
                  key={t}
                  label={t}
                  selected
                  onRemove={() => setTagNames(tagNames.filter((x) => x !== t))}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <OptionSheet
        visible={showRecSheet}
        title="Repetir"
        options={recOptions}
        selectedValue={recurrence ?? 'nunca'}
        onSelect={(v) => {
          const rec = v === 'nunca' ? null : (v as Recurrence);
          setRecurrence(rec);
          if (rec !== 'semanal_dias') setRepeatDays([]);
        }}
        onClose={() => setShowRecSheet(false)}
      />
      <OptionSheet
        visible={showListSheet}
        title="Lista"
        options={listOptions}
        selectedValue={listId ?? 'none'}
        onSelect={(v) => setListId(v === 'none' ? null : v)}
        onClose={() => setShowListSheet(false)}
      />
      <OptionSheet
        visible={showAdvanceSheet}
        title="Avisar antes"
        options={ADVANCE_OPTIONS}
        selectedValue={
          ADVANCE_OPTIONS.find((o) => o.value === String(advanceMinutes))
            ? String(advanceMinutes)
            : 'custom'
        }
        onSelect={handleAdvanceSelect}
        onClose={() => setShowAdvanceSheet(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  titleInput: { fontSize: 18, marginBottom: 10 },
  notesInput: { minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  card: { borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowText: { marginLeft: 12, flex: 1 },
  rowValue: { flexDirection: 'row', alignItems: 'center' },
  pickerRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: 10, letterSpacing: 0.5 },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  suggestChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 4 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
});
