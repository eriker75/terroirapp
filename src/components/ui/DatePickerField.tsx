import { useMemo, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

// Selector de fecha en JS puro (sin dependencias nativas): un campo que abre un
// modal con un calendario mensual. No permite fechas futuras (tope = hoy) y es
// opcional (botón "Limpiar"). Devuelve/recibe la fecha como "YYYY-MM-DD".

interface DatePickerFieldProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Año mínimo navegable (default 1900). */
  minYear?: number;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // lunes-primero

const pad2 = (n: number) => String(n).padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

function parseISO(s?: string): { y: number; m: number; d: number } | null {
  if (!s) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  if (m < 0 || m > 11 || d < 1 || d > 31) return null;
  return { y, m, d };
}

function formatDisplay(s?: string): string | null {
  const p = parseISO(s);
  if (!p) return null;
  return `${p.d} ${MONTHS_SHORT[p.m]} ${p.y}`;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = 'AAAA-MM-DD',
  minYear = 1900,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  // "Hoy" (componentes locales) para acotar el máximo seleccionable.
  const now = new Date();
  const today = { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };

  const selected = parseISO(value);
  const [view, setView] = useState(() => ({
    y: selected?.y ?? today.y,
    m: selected?.m ?? today.m,
  }));

  // Grilla del mes en vista (lunes-primero).
  const grid = useMemo(() => {
    const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // 0=lunes
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view.y, view.m]);

  const isFuture = (d: number) =>
    view.y > today.y ||
    (view.y === today.y && view.m > today.m) ||
    (view.y === today.y && view.m === today.m && d > today.d);

  const isSelected = (d: number) =>
    selected != null && selected.y === view.y && selected.m === view.m && selected.d === d;

  // Navegación: no se permite avanzar a meses/años futuros.
  const canNextMonth = view.y < today.y || (view.y === today.y && view.m < today.m);
  const canNextYear = view.y < today.y;
  const canPrevYear = view.y > minYear;

  const stepMonth = (delta: number) => {
    setView((v) => {
      let m = v.m + delta;
      let y = v.y;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      if (y < minYear) { y = minYear; m = 0; }
      // No pasar de hoy.
      if (y > today.y || (y === today.y && m > today.m)) { y = today.y; m = today.m; }
      return { y, m };
    });
  };

  const stepYear = (delta: number) => {
    setView((v) => {
      let y = v.y + delta;
      if (y < minYear) y = minYear;
      if (y > today.y) y = today.y;
      let m = v.m;
      if (y === today.y && m > today.m) m = today.m;
      return { y, m };
    });
  };

  const pick = (d: number) => {
    onChange(toISO(view.y, view.m, d));
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setOpen(false);
  };

  const display = formatDisplay(value);

  return (
    <>
      <TouchableOpacity
        style={styles.field}
        onPress={() => {
          // Al abrir, posicionar el calendario en la fecha elegida (o hoy).
          const sel = parseISO(value);
          setView({ y: sel?.y ?? today.y, m: sel?.m ?? today.m });
          setOpen(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.fieldText, !display && styles.placeholder]}>
          {display ?? placeholder}
        </Text>
        <Calendar size={16} color={COLORS.muted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            {/* Header de navegación */}
            <View style={styles.navRow}>
              <View style={styles.navGroup}>
                <NavBtn disabled={!canPrevYear} onPress={() => stepYear(-1)}>
                  <ChevronsLeft size={18} color={canPrevYear ? COLORS.darkBrown : COLORS.darkBrownLight} />
                </NavBtn>
                <NavBtn onPress={() => stepMonth(-1)}>
                  <ChevronLeft size={18} color={COLORS.darkBrown} />
                </NavBtn>
              </View>

              <Text style={styles.title}>{MONTHS[view.m]} {view.y}</Text>

              <View style={styles.navGroup}>
                <NavBtn disabled={!canNextMonth} onPress={() => stepMonth(1)}>
                  <ChevronRight size={18} color={canNextMonth ? COLORS.darkBrown : COLORS.darkBrownLight} />
                </NavBtn>
                <NavBtn disabled={!canNextYear} onPress={() => stepYear(1)}>
                  <ChevronsRight size={18} color={canNextYear ? COLORS.darkBrown : COLORS.darkBrownLight} />
                </NavBtn>
              </View>
            </View>

            {/* Cabecera de días */}
            <View style={styles.weekRow}>
              {WEEKDAYS.map((w, i) => (
                <Text key={i} style={styles.weekday}>{w}</Text>
              ))}
            </View>

            {/* Grilla de días */}
            <View style={styles.grid}>
              {grid.map((d, i) => {
                if (d == null) return <View key={i} style={styles.cell} />;
                const future = isFuture(d);
                const sel = isSelected(d);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.cell, sel && styles.cellSelected]}
                    disabled={future}
                    onPress={() => pick(d)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        sel && styles.cellTextSelected,
                        future && styles.cellTextDisabled,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Acciones */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.clearBtn} onPress={clear}>
                <X size={14} color={COLORS.muted} />
                <Text style={styles.clearText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
                <Text style={styles.closeText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function NavBtn({
  children,
  onPress,
  disabled,
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.navBtn} onPress={onPress} disabled={disabled} activeOpacity={0.6}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fieldText: { fontSize: 15, color: COLORS.darkBrown },
  placeholder: { color: COLORS.darkBrownMuted },

  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navGroup: { flexDirection: 'row', gap: 2 },
  navBtn: { padding: 6, borderRadius: 8 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.darkBrown },

  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    paddingVertical: 6,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: COLORS.accent,
    borderRadius: 999,
  },
  cellText: { fontSize: 14, color: COLORS.darkBrown },
  cellTextSelected: { color: COLORS.white, fontWeight: '700' },
  cellTextDisabled: { color: COLORS.darkBrownLight },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 6 },
  clearText: { fontSize: 14, color: COLORS.muted, fontWeight: '600' },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, backgroundColor: COLORS.lightBeige },
  closeText: { fontSize: 14, color: COLORS.darkBrown, fontWeight: '700' },
});
