import { COLORS } from '@/constants/colors';
import { Search, X } from 'lucide-react-native';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  /** Se llama al tocar la X. Si no se pasa, limpia con onChangeText(''). */
  onClear?: () => void;
  /** Se llama al confirmar la búsqueda desde el teclado. */
  onSubmit?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Estilo extra para el contenedor (márgenes, etc.). */
  style?: StyleProp<ViewStyle>;
};

/**
 * Barra de búsqueda de productos reutilizable (presentacional, controlada).
 * El estado/debounce vive fuera — combinar con `useProductSearch`:
 *
 *   const { search, setSearch, debouncedSearch, clearSearch } = useProductSearch();
 *   <SearchBar value={search} onChangeText={setSearch} onClear={clearSearch} />
 */
export function SearchBar({
  value,
  onChangeText,
  onClear,
  onSubmit,
  placeholder = 'Buscar café, origen, tostado...',
  autoFocus,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Search size={16} color={COLORS.darkBrown + '80'} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.darkBrown + '60'}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={() => onSubmit?.(value)}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => (onClear ? onClear() : onChangeText(''))}>
          <X size={15} color={COLORS.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.darkBrown },
});
