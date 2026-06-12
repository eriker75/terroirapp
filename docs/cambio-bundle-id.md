# Migración de identidad: `com.terroir.eribert` → `com.terroir.app`

Guía para cambiar el package de Android y el bundle identifier de iOS.

> ⚠️ **HACERLO ANTES del primer `eas build --profile production` que se suba a
> una tienda.** Una vez publicada, la identidad NO se puede cambiar jamás:
> "cambiarla" sería publicar una app nueva desde cero (listing nuevo, reseñas
> en cero, sin auto-update para los usuarios). Antes de publicar, esta
> migración es ~1 hora de configuración sin impacto.

## Qué está atado a `com.terroir.eribert` hoy

| Pieza | Dónde |
|---|---|
| Package Android | `app.json` → `expo.android.package` |
| Bundle iOS | `app.json` → `expo.ios.bundleIdentifier` |
| Keystore de firma (EAS) | credencial `TerroirBuildCredential` asociada al identifier `com.terroir.eribert` — SHA-1 `87:5A:1A:90:AC:CE:1E:BF:2D:1F:CD:2C:CD:EE:FC:C6:4C:AA:07:C2` |
| OAuth client Android (Google) | consola GCP: package + ese SHA-1 |
| OAuth client iOS (Google) | consola GCP: bundle → su client ID está en `eas.json`, `.env` (`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`) y `app.json` (`iosUrlScheme`, invertido) |
| Backend | `APPLE_BUNDLE_ID` (+ `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`) en `backend/Makefile` y `backend/cloudbuild.yaml` |
| Apple Developer | App ID registrado (lo crea EAS en el primer build iOS) |

**No cambian**: el OAuth client **Web** de Google (no sabe de packages), el
backend desplegado, el `owner`/`projectId` de Expo, ni el keystore en sí
(se reutiliza — ver paso 2).

## Pasos

### 1. app.json

```jsonc
"ios":     { "bundleIdentifier": "com.terroir.app", ... }
"android": { "package": "com.terroir.app", ... }
```

### 2. Keystore: REUTILIZAR el existente (crítico)

Las credenciales de EAS van por *Application Identifier*: con el package nuevo,
`eas credentials -p android` dirá "No credentials set up yet". **NO generar un
keystore nuevo** (cambiaría el SHA-1 y rompería el login de Google):

```bash
# a) Descargar el keystore actual (identifier viejo aún configurado o desde la web de Expo):
eas credentials -p android   # → com.terroir.eribert → Download existing keystore
#    Guarda el .jks y las contraseñas que imprime.

# b) Con app.json ya cambiado, asignarlo al identifier nuevo:
eas credentials -p android   # → com.terroir.app → Keystore →
#    "Set up a keystore from an existing file" → subir el .jks + contraseñas
```

Verifica que el SHA-1 mostrado sea el MISMO (`87:5A:1A:90:...`).

### 3. Regenerar carpetas nativas

```bash
npx expo prebuild --clean
```

### 3b. Firebase (push FCM)

En el proyecto Firebase (mismo `terroir-497922`): ⚙️ Configuración → Tus apps →
**Agregar app Android** con el package nuevo `com.terroir.app` → descargar su
`google-services.json` nuevo → reemplazar el de `mobile/` → `prebuild --clean`.
La llave FCM V1 de EAS no cambia (es por proyecto Firebase, no por app).

### 4. Consola de Google (APIs y servicios → Credenciales)

Los OAuth clients no se editan: se crean nuevos y luego se borran los viejos.

- **Android nuevo**: package `com.terroir.app` + el mismo SHA-1 de siempre.
- **iOS nuevo**: bundle `com.terroir.app` → copia el **client ID nuevo**.
- (Cuando todo funcione: eliminar los dos clients de `com.terroir.eribert`.)

### 5. Cablear el client ID iOS nuevo (3 lugares en mobile)

- `eas.json` → `build.preview.env` y `build.production.env` →
  `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `.env` → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `app.json` → plugin `@react-native-google-signin/google-signin` →
  `iosUrlScheme`: el client ID iOS **invertido**:
  `com.googleusercontent.apps.XXXXXXXX` (sin el sufijo `.apps.googleusercontent.com`)

### 6. Backend (repo terroirback)

En `Makefile` (sección GCP) y `cloudbuild.yaml` (substitutions/env):

```
APPLE_BUNDLE_ID          = com.terroir.app
GOOGLE_IOS_CLIENT_ID     = <client ID iOS nuevo>
GOOGLE_ANDROID_CLIENT_ID = <client ID Android nuevo>
```

Redesplegar: `cd backend && make gcp-deploy` (o push a main).

### 7. Apple (solo si ya se usaba Sign in with Apple / builds iOS)

- El primer `eas build -p ios` registra el App ID `com.terroir.app` en el
  portal (aceptar los prompts de EAS).
- Si existe el Services ID del login con Apple en web, no cambia (es otro
  identificador), pero el `APPLE_BUNDLE_ID` del backend sí (paso 6).

### 8. Rebuilds y dispositivos

```bash
eas build --profile development --platform android   # nuevo dev client
eas build --profile preview --platform android       # nuevo APK compartible
```

En los teléfonos de prueba: **desinstalar** la app vieja (`com.terroir.eribert`)
e instalar la nueva — para Android son apps distintas, no hay update.
Los push tokens viejos quedan huérfanos (la tabla `push_tokens` del backend
los irá purgando al fallar; no requiere acción).

## Verificación final

- [ ] `eas credentials -p android` (identifier nuevo) muestra el SHA-1 de siempre
- [ ] Login con Google funciona en un build nuevo (Android)
- [ ] Login con Google funciona en iOS (si aplica)
- [ ] `GET /api/payments/methods` y checkout móvil siguen OK (no dependen del package)
- [ ] Borrados los OAuth clients de `com.terroir.eribert`
