import { useCallback, useEffect, useState } from 'react';
import { normalizeSearch } from '@/lib/search';

/**
 * Estado de búsqueda de productos con debounce.
 *
 * `search` refleja el input al instante (para la UI); `debouncedSearch` es el
 * término normalizado (sin acentos, minúsculas) que se actualiza `debounceMs`
 * después de dejar de teclear — es el valor que debe usarse para filtrar.
 */
export function useProductSearch(debounceMs = 300) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(normalizeSearch(search)), debounceMs);
    return () => clearTimeout(t);
  }, [search, debounceMs]);

  const clearSearch = useCallback(() => setSearch(''), []);

  return { search, setSearch, debouncedSearch, clearSearch };
}
