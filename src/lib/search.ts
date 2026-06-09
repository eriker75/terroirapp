// Normaliza texto para una búsqueda tolerante: minúsculas, sin acentos/diacríticos
// y espacios colapsados. Así "Café Etiopía" y "cafe   etiopia" se comparan igual.
// Se usa en el filtro del catálogo (compara nombre normalizado vs término normalizado).
export function normalizeSearch(input: string | null | undefined): string {
  return (input ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita los diacríticos (tildes, diéresis, ñ→n)
    .replace(/\s+/g, ' ')
    .trim();
}
