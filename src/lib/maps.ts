// Extrae coordenadas de una URL de Google Maps si están presentes en el enlace
// (@lat,lng | !3dlat!4dlng | q=lat,lng). Sirve para centrar el mapa de la app en
// la ubicación que el admin configuró en settings (`contact_maps_url`). Devuelve
// null si la URL no trae coordenadas (p. ej. un enlace corto maps.app.goo.gl).
export function extractMapsCoords(
  url: string | null | undefined,
): { lat: number; lng: number } | null {
  const v = (url ?? '').trim();
  if (!v) return null;
  const m =
    v.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    v.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ||
    v.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
