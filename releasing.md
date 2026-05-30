# Releasing

Guía de cómo armar builds de Terroir (Android e iOS) y cómo se controla la URL del backend en cada uno.

## TL;DR — scripts más usados

```bash
npm run build:android:prod         # AAB de prod (subir al Play Store)
npm run build:android:staging      # AAB apuntando a staging
npm run build:android:apk:prod     # APK de prod (instalación directa / sideload)
npm run build:android:apk:staging  # APK apuntando a staging
npm run clean:android              # Borra artefactos de Gradle/CMake

npm run eas:build:prod             # Build cloud (Android + iOS) prod
npm run eas:build:staging          # Build cloud (Android + iOS) staging
npm run eas:submit:prod            # Subir el último build prod al store
```

Todos los scripts están en [package.json](package.json).

## Cómo se resuelve la URL del backend

La lógica vive en [src/config/api.ts](src/config/api.ts) en `resolveBaseUrl()`. Prioridad de mayor a menor:

1. **`process.env.EXPO_PUBLIC_BACKEND_URL`** — si está definida, gana siempre.
2. **Autodetección en dev** — si `__DEV__ === true`, usa `http://<IP-de-Metro>:<EXPO_PUBLIC_DEV_BACKEND_PORT|3000>`. La IP la saca de `Constants.expoConfig?.hostUri`, que coincide con `ipconfig getifaddr en0` en tu Mac.
3. **Fallback de producción** — `https://terroirapp.com` (constante `PROD_BACKEND_URL` en `api.ts`).

`__DEV__` lo controla Metro automáticamente: `true` en builds de desarrollo (`expo start`, `expo run:*`), `false` en cualquier build de release. **No depende** de `NODE_ENV`.

## Variables de entorno relevantes

| Variable | Dónde se define | Efecto |
|---|---|---|
| `EXPO_PUBLIC_BACKEND_URL` | `.env` local, inline en scripts, o `eas.json` por profile | Override total de la URL del backend |
| `EXPO_PUBLIC_DEV_BACKEND_PORT` | `.env` local | Puerto del backend en dev (default `3000`) |

Cualquier var con prefijo `EXPO_PUBLIC_*` se incrusta en el bundle JS al momento de armarlo, no en runtime.

## Builds locales con Gradle

Los scripts `build:android:*` envuelven `./gradlew assembleRelease` / `bundleRelease` con la env var inline correspondiente:

```bash
npm run build:android:prod         # cd android && EXPO_PUBLIC_BACKEND_URL=https://terroirapp.com ./gradlew bundleRelease
npm run build:android:staging      # idem con https://staging.terroirapp.com
npm run build:android:apk:prod     # idem pero assembleRelease (APK en vez de AAB)
npm run build:android:apk:staging
```

Salidas:
- AAB → `android/app/build/outputs/bundle/release/app-release.aab` (para Play Store)
- APK → `android/app/build/outputs/apk/release/app-release.apk` (para sideload / QA)

Internamente Gradle invoca `npx expo export:embed` para generar el bundle JS. Ese paso lee las env vars del entorno (incluidas las que pasamos inline), y como el flag de release está activo, `__DEV__` queda `false`.

### Por qué inline y no `cp .env.production .env`

El patrón `cp .env.staging .env && ./gradlew ...` también funciona pero tiene dos problemas:

1. **Muta `.env`**, que está versionado (no está en `.gitignore`). Cada build deja `git status` sucio.
2. Si después corres `npm run android` para dev, el override copiado sigue activo y rompe la autodetección de Metro.

Por eso preferimos pasar la var inline: no toca archivos, no contamina dev. Si en algún momento necesitás más de una var, podés:

- Encadenarlas inline: `VAR1=a VAR2=b ./gradlew ...`
- Agregar `dotenv-cli` (`npm i -D dotenv-cli`) y usar `dotenv -e .env.staging -- ...`
- Volver al patrón de `cp` (y agregar `.env` al `.gitignore`)

## Builds en la nube con EAS

EAS (Expo Application Services) es el servicio de Expo para armar binarios en la nube — corre `expo prebuild`, compila código nativo, firma y devuelve el AAB/IPA. Sirve para no tener que mantener Android Studio + Xcode + keystores localmente.

### Setup inicial (una sola vez por máquina)

```bash
npm install -g eas-cli      # CLI global
eas login                   # con tu cuenta de Expo (owner: somosnododev)
eas whoami                  # verificar que estás logueado
```

El proyecto ya está vinculado: ver `extra.eas.projectId` en [app.json](app.json) (`44db9555-c202-4fa0-a582-03b00dd0dfee`) y `owner: somosnododev`. No hace falta `eas init` de nuevo.

### Profiles configurados

Los profiles viven en [eas.json](eas.json). Resumen de qué hace cada uno:

| Profile | `distribution` | Tipo | URL inyectada | Para qué sirve |
|---|---|---|---|---|
| `development` | `internal` | dev client (con Metro) | (autodetecta) | Builds con dev menu, hot reload, debugging — para devs |
| `preview` | `internal` | APK release | `staging.terroirapp.com` | QA interno, instalable por sideload sin store |
| `browserstack` | `internal` | AAB release | `staging.terroirapp.com` | Para subir a BrowserStack y testear en dispositivos remotos |
| `production` | `store` | AAB release | `terroirapp.com` | Lo que sube al Play Store / App Store |

`distribution: internal` genera un link de instalación directa (QR + URL). `distribution: store` arma binarios listos para subir al store (requiere submit).

### Scripts npm

```bash
npm run eas:build:prod           # production, ambas plataformas
npm run eas:build:staging        # preview, ambas plataformas
npm run eas:build:android:prod   # production, solo Android
npm run eas:build:ios:prod       # production, solo iOS
npm run eas:submit:prod          # sube el último build prod al Play Store y App Store
```

O directo sin npm:

```bash
eas build --profile <profile> --platform <android|ios|all>
eas build --profile production --platform android --local   # arma localmente con Docker (no en la nube)
```

### Variables de entorno en EAS

Hay tres lugares donde pueden vivir env vars que afecten un EAS build:

1. **`eas.json` → `build.<profile>.env`** (lo que tenemos hoy con `EXPO_PUBLIC_BACKEND_URL`). Visible en el repo. Apto para URLs públicas, NO para secretos.
2. **EAS Secrets** (dashboard de Expo o `eas secret:create`). Encriptados, no versionados. Apto para tokens, API keys, etc.
3. **Variables locales del shell** cuando se corre `eas build --local`.

**Importante:** las `env` definidas en `eas.json` solo aplican a `eas build`. No tienen efecto en builds locales de Gradle. Y viceversa: tu `.env` local no llega al build de EAS.

Para agregar un secreto:

```bash
eas secret:create --scope project --name STRIPE_SECRET_KEY --value sk_live_xxx
eas secret:list
```

Después se accede como `process.env.STRIPE_SECRET_KEY` durante el build. **Solo usar `EXPO_PUBLIC_*` para cosas que NO sean secretos** (todo lo `EXPO_PUBLIC_*` se incrusta en el bundle JS y queda visible si alguien decompila el APK).

### Credenciales (keystore / certificados)

EAS maneja signing por vos. La primera vez que armes un build de release, te va a preguntar:

- **Android**: te ofrece generar un keystore nuevo o subir uno existente. Una vez generado, lo guarda en su servidor y lo reutiliza en cada build.
- **iOS**: lo mismo con distribution certs y provisioning profiles. Necesitás tu Apple ID con acceso al team `com.terroir.eribert`.

Para inspeccionar o cambiar las credenciales:

```bash
eas credentials                  # menu interactivo
eas credentials --platform android
eas credentials --platform ios
```

**Backupeá el keystore Android.** Si lo perdés, no podés actualizar la app en el Play Store nunca más (hay que publicar como app nueva). Bajarlo con `eas credentials` → Android → Download credentials.

### Submit a los stores

`eas:submit:prod` requiere config en [eas.json](eas.json) bajo `"submit"`. **Hoy no está configurado** — habría que agregarlo cuando estemos cerca de publicar. Algo así:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./pc-api-xxx.json",
      "track": "internal"
    },
    "ios": {
      "appleId": "tu-apple-id@somosnodo.dev",
      "ascAppId": "1234567890",
      "appleTeamId": "ABC123XYZ"
    }
  }
}
```

Lo que se necesita preparar antes:

- **Android**: una Google Cloud service account con permisos en el Play Console (download JSON key, ponerlo en el repo o en EAS Secrets como `GOOGLE_SERVICES_JSON`). Crear la app en el Play Console primero.
- **iOS**: App Store Connect API key, o usar tu Apple ID con 2FA (EAS pide código cada vez). Crear la app en App Store Connect primero.

Una vez configurado:

```bash
npm run eas:submit:prod                     # submit último build de prod
eas submit --profile production --platform android --id <build-id>   # un build específico
```

### Monitoreo de builds

```bash
eas build:list                              # últimos builds
eas build:list --limit 5                    # solo últimos 5
eas build:view <build-id>                   # detalles + URL del binario
eas build:cancel <build-id>                 # cancelar uno en curso
```

O en el dashboard: https://expo.dev/accounts/somosnododev/projects/terroir/builds

Los logs completos están en el dashboard. Útil cuando un build falla — la consola local solo muestra los últimos errores.

### EAS Update (OTA, opcional)

EAS Update permite publicar **cambios solo de JS** (sin pasar por el store) directamente a clientes ya instalados:

```bash
eas update --branch production --message "fix: typo en checkout"
```

Esto re-armaría solo el bundle JS y lo subiría. Los devices con la app instalada lo descargan al próximo abrir. **Solo sirve para cambios de código JS** — cualquier cosa que toque dependencias nativas necesita un build nuevo + release al store.

Hoy no está configurado (`expo-updates` está deshabilitado en el manifest: `expo.modules.updates.ENABLED=false`). Activarlo cuando haga falta.

## Network security (Android)

La política de tráfico cleartext está separada por build variant:

- `android/app/src/main/res/xml/network_security_config.xml` → release. Solo HTTPS, whitelist `terroirapp.com` (con subdominios).
- `android/app/src/debug/res/xml/network_security_config.xml` → debug. Cleartext permitido a cualquier host (para LAN/emulador).
- `android/app/src/debugOptimized/res/xml/network_security_config.xml` → debugOptimized. Mismo permisivo.

El AndroidManifest lo enlaza vía `android:networkSecurityConfig="@xml/network_security_config"` y Gradle elige la versión correcta según la variante.

### Cuidado con `expo prebuild`

`/android` está en `.gitignore`. Si alguna vez corres `npx expo prebuild --clean` (o EAS lo corre por su cuenta al armar), **se regenera la carpeta y los XMLs de network security se pierden**. Lo mismo aplica a cualquier edición manual del `AndroidManifest.xml`.

Para que estos cambios persistan después de un prebuild, hay que moverlos a un **Expo config plugin** (un archivo JS que parchea el manifest/recursos automáticamente). Mientras no lo hagamos, evitar `prebuild --clean` o restaurar los archivos a mano después.

Builds cloud de EAS sí corren `prebuild` por defecto. Para que los XMLs lleguen al build de EAS, hay que crear el config plugin o committear `/android` (sacarlo del `.gitignore`). Pendiente decidir cuál.

## Signing

Para que `assembleRelease` / `bundleRelease` produzcan un binario firmado e instalable, necesitás el keystore configurado en `android/gradle.properties` (o `~/.gradle/gradle.properties`):

```properties
MYAPP_RELEASE_STORE_FILE=terroir-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=terroir-key-alias
MYAPP_RELEASE_STORE_PASSWORD=...
MYAPP_RELEASE_KEY_PASSWORD=...
```

Y el keystore en `android/app/`. Sin esto, el build falla o queda sin firmar.

En EAS el signing lo maneja el servicio (subís el keystore una vez con `eas credentials`).

## Checklist antes de releasear a producción

- [ ] Bump de version en `app.json` (`expo.version`)
- [ ] Bump de `android.versionCode` / `ios.buildNumber` en `app.json`
- [ ] `EXPO_PUBLIC_BACKEND_URL` correcta (script usado o `eas.json` profile)
- [ ] Keystore presente (local) o credenciales subidas (EAS)
- [ ] Probado el AAB/APK en dispositivo real
- [ ] Network security: si tocaste `/android` a mano, confirmar que los XMLs siguen en su lugar

## Troubleshooting

### `TurboModule installTurboModule called with N arguments`

Mismatch entre la JS binding de un módulo nativo (gesture-handler, reanimated, worklets) y el código nativo compilado. Pasa cuando se actualizan paquetes JS y se reinstala el APK sin recompilar lo nativo (`npm start` + `a` solo abre el APK existente).

Fix:

```bash
npm run clean:android
npm run android   # recompila nativo desde cero
```

### `gradlew clean` falla con "GLOB mismatch" / codegen jni no existe

Problema conocido de la New Architecture: `clean` requiere que el codegen haya corrido antes. Usá `npm run clean:android` (borra `app/.cxx`, `app/build`, `build`, `.gradle` manualmente) en lugar de `./gradlew clean`.

### El backend dev no responde desde el dispositivo

- Confirmar que el backend escucha en `0.0.0.0` (no solo en `127.0.0.1`).
- En emulador Android usar `10.0.2.2` apunta al host. La autodetección de `api.ts` ya devuelve la IP de Metro (LAN), así que debería andar sin tocar nada.
- Verificar que el firewall de macOS no esté bloqueando el puerto 3000.
