import { Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { COLORS } from '@/constants/colors';

export interface LocationResult {
  latitude: number;
  longitude: number;
  displayName: string;
  shortName?: string;
}

export interface MapPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  onLocationSelect?: (location: LocationResult) => void;
  height?: number;
  placeholder?: string;
  countryCode?: string;
  zoomLevel?: number;
  /** Hides the search input and disables marker drag / map taps. */
  readOnly?: boolean;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'TerroirApp/1.0';
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 420;
const FALLBACK_COORDS = { lat: 10.5061, lng: -66.8956 };

async function searchPlaces(query: string, countryCode?: string): Promise<NominatimResult[]> {
  const country = countryCode ? `&countrycodes=${countryCode}` : '';
  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6${country}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return [];
  return res.json();
}

async function reverseLookup(lat: number, lng: number): Promise<NominatimResult | null> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) return null;
  return res.json();
}

const buildLeafletHTML = (lat: number, lng: number, zoom: number, readOnly: boolean) => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <style>
    html,body{margin:0;padding:0;height:100%;background:${COLORS.lightBeige};}
    #map{width:100%;height:100%;position:absolute;top:0;left:0;}
    .leaflet-container{background:${COLORS.lightBeige};}
    .leaflet-control-zoom{border:none!important;box-shadow:0 2px 8px rgba(54,30,28,.18)!important;}
    .leaflet-control-zoom a{background:${COLORS.white}!important;color:${COLORS.darkBrown}!important;border:1px solid ${COLORS.border}!important;}
    .leaflet-control-zoom a:hover{background:${COLORS.lightBeige}!important;}
    .drag-hint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(54,30,28,.88);color:#fff;font-size:11px;font-family:system-ui,sans-serif;padding:5px 12px;border-radius:20px;pointer-events:none;z-index:999;white-space:nowrap;transition:opacity .35s;}
    .drag-hint.hidden{opacity:0;}
  </style>
</head>
<body>
  <div id="map"></div>
  ${readOnly ? '' : '<div id="hint" class="drag-hint">Arrastra el marcador o toca el mapa</div>'}
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: true,
      touchZoom: true
    }).setView([${lat}, ${lng}], ${zoom});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    var marker = L.marker([${lat}, ${lng}], { draggable: ${readOnly ? 'false' : 'true'} }).addTo(map);
    var hint = document.getElementById('hint');

    function postMove(lat, lng) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'move', lat: lat, lng: lng }));
      }
    }

    function hideHint() { if (hint) hint.classList.add('hidden'); }

    ${readOnly ? '' : `
    marker.on('dragstart', hideHint);
    marker.on('dragend', function() {
      var p = marker.getLatLng();
      postMove(p.lat, p.lng);
    });

    map.on('click', function(e) {
      hideHint();
      marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      postMove(e.latlng.lat, e.latlng.lng);
    });
    `}

    window.moveTo = function(lat, lng, zoom) {
      map.setView([lat, lng], zoom || ${zoom});
      marker.setLatLng([lat, lng]);
      hideHint();
    };

    setTimeout(function() { map.invalidateSize(); }, 120);

    document.addEventListener('touchmove', function(e) {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
  </script>
</body>
</html>`;

export function MapPicker({
  initialLatitude,
  initialLongitude,
  initialAddress,
  onLocationSelect,
  height = 320,
  placeholder = 'Escribe la dirección de entrega...',
  countryCode,
  zoomLevel = 15,
  readOnly = false,
}: MapPickerProps) {
  const startLat = initialLatitude ?? FALLBACK_COORDS.lat;
  const startLng = initialLongitude ?? FALLBACK_COORDS.lng;

  const [query, setQuery] = useState(initialAddress ?? '');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  const webViewRef = useRef<WebView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const htmlContent = useMemo(
    () => buildLeafletHTML(startLat, startLng, zoomLevel, readOnly),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const panMapTo = useCallback(
    (toLat: number, toLng: number) => {
      webViewRef.current?.injectJavaScript(
        `window.moveTo(${toLat}, ${toLng}, ${zoomLevel}); true;`
      );
    },
    [zoomLevel],
  );

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      clearTimeout(debounceRef.current);
      if (text.length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          setSuggestions(await searchPlaces(text, countryCode));
        } catch {
          setSuggestions([]);
        } finally {
          setSearching(false);
        }
      }, DEBOUNCE_MS);
    },
    [countryCode],
  );

  const handleSelectSuggestion = useCallback(
    (item: NominatimResult) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const shortName = item.name || item.display_name.split(',')[0];

      setQuery(item.display_name);
      setSuggestions([]);
      Keyboard.dismiss();
      panMapTo(lat, lng);

      onLocationSelect?.({
        latitude: lat,
        longitude: lng,
        displayName: item.display_name,
        shortName,
      });
    },
    [onLocationSelect, panMapTo],
  );

  const handleMapMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type !== 'move') return;

        const lat = msg.lat as number;
        const lng = msg.lng as number;
        const result = await reverseLookup(lat, lng);
        const displayName = result?.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const shortName = result?.name ?? result?.display_name?.split(',')[0];

        setQuery(displayName);
        setSuggestions([]);
        onLocationSelect?.({ latitude: lat, longitude: lng, displayName, shortName });
      } catch {
        // ignore malformed messages
      }
    },
    [onLocationSelect],
  );

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <View style={styles.root}>
      {!readOnly && (
        <View style={styles.searchBox}>
          <Search size={16} color={COLORS.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleQueryChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.darkBrownMuted}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searching && (
            <ActivityIndicator size="small" color={COLORS.accent} style={styles.spinner} />
          )}
          {query.length > 0 && !searching && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setSuggestions([]);
              }}
              hitSlop={8}
            >
              <X size={16} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {!readOnly && suggestions.length > 0 && (
        <View style={styles.suggestionsCard}>
          {suggestions.map((item, idx) => (
            <View key={String(item.place_id)}>
              {idx > 0 && <View style={styles.separator} />}
              <TouchableOpacity
                style={styles.suggestionRow}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionPrimary} numberOfLines={1}>
                  {item.name || item.display_name.split(',')[0]}
                </Text>
                <Text style={styles.suggestionSecondary} numberOfLines={1}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.mapContainer, { height }]}>
        {mapLoading && (
          <View style={styles.mapOverlay}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.mapLoadingText}>Cargando mapa...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webview}
          onLoadEnd={() => setMapLoading(false)}
          onMessage={handleMapMessage}
          javaScriptEnabled
          domStorageEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBeige,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, color: COLORS.darkBrown, fontSize: 14 },
  spinner: { marginLeft: 8 },
  suggestionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 240,
    overflow: 'hidden',
    shadowColor: COLORS.darkBrown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionRow: { paddingHorizontal: 14, paddingVertical: 10 },
  suggestionPrimary: {
    color: COLORS.darkBrown,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionSecondary: { color: COLORS.muted, fontSize: 11 },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14 },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.lightBeige,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webview: { flex: 1, backgroundColor: 'transparent' },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightBeige,
    zIndex: 1,
  },
  mapLoadingText: { marginTop: 10, color: COLORS.muted, fontSize: 13 },
});
