# Notas de red para desarrollo (app mobile)

## Encontrar la IP LAN de la Mac

El comando correcto es `ipconfig getifaddr <interfaz>` (NO `get ipconfig`):

```sh
ipconfig getifaddr en0
```

⚠️ En esta Mac la IP LAN no siempre está en `en0` (ha estado en `en7`). Si `en0`
devuelve vacío, prueba otra interfaz o usa estos one-liners que no dependen de
adivinar la interfaz:

```sh
# IP de la interfaz de la ruta por defecto (la que usa internet/WiFi)
ipconfig getifaddr $(route -n get default | awk '/interface:/{print $2}')

# O lista todas las IPs locales (descarta 127.0.0.1)
ifconfig | grep "inet " | grep -v 127.0.0.1
```

> La IP LAN cambia con DHCP (ha sido 192.168.100.5 y luego 192.168.100.9). Si la
> fijas en `.env`, hay que actualizarla cuando cambie.

## Cómo apuntar la app al backend en dev

Dos caminos (el backend corre en Docker, puerto 3000):

### A) USB + adb reverse  ← más estable
- Deja `EXPO_PUBLIC_BACKEND_URL` **comentado** en `.env` → autodetecta `localhost:3000`.
- Reenvía el puerto por USB: `npm run adb:reverse` (o ya lo hace `npm start`).
- Va por el cable USB, no depende de la WiFi.
- El `adb reverse` es efímero: se pierde al reconectar el teléfono o reiniciar Metro;
  `npm start` lo reestablece.

### B) IP LAN  ← cómodo pero depende de la WiFi
- En `.env`: `EXPO_PUBLIC_BACKEND_URL=http://<IP-LAN>:3000` (p.ej. `http://192.168.100.9:3000`).
- Requiere **reiniciar Metro** (las `EXPO_PUBLIC_*` se inyectan al bundlear; usa
  `npm start -- --clear` si no toma el cambio).
- El teléfono y la Mac deben estar en la misma WiFi y el router no debe aislar clientes.
- Falla si la WiFi está inestable (pérdida de paquetes) — en ese caso, usa el camino A.

## Diagnóstico rápido cuando "Error al iniciar sesión"

```sh
# ¿el backend responde por localhost y por la IP LAN?
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api
curl -s -o /dev/null -w "%{http_code}\n" http://<IP-LAN>:3000/api

# ¿el adb reverse está puesto?
adb reverse --list      # debe listar tcp:8081 y tcp:3000

# ¿la petición del teléfono llega al backend?
docker logs --since 5m terroir_backend | grep "\[login\]"
```

En el arranque de la app, el log `[api] backend → http://…/api` muestra a qué host
está apuntando realmente.
