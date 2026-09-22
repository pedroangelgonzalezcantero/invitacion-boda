# Diagnóstico de Autenticación Spotify

## Problema Identificado
La búsqueda de Spotify no funciona en producción pero sí en local. Esto sugiere que las credenciales no se están cargando correctamente en el entorno de producción.

## Pasos para Diagnosticar

### 1. Verificar las Credenciales en Producción
Accede a tu endpoint de diagnóstico (nuevo):
```
GET https://tu-dominio.com/api/spotify-test
```

Este endpoint verificará:
- ✅ Si las variables de entorno `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` están cargadas
- ✅ Si es posible autenticarse con Spotify usando esas credenciales
- ✅ Si las búsquedas en Spotify funcionan correctamente

La respuesta te mostrará exactamente dónde está el problema.

### 2. Si las Variables no están Cargadas
Si el test dice que faltan variables de entorno, necesitas:

1. **En Vercel (o tu proveedor de hosting):**
   - Ve a Settings > Environment Variables
   - Asegúrate de que `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` estén configuradas
   - Verifica que no haya espacios en blanco al inicio/final
   - Redeploy la aplicación después de añadir/cambiar variables

2. **En tu `.env.local` local:**
   - Actualmente tienes:
     ```
     SPOTIFY_CLIENT_ID=f0b0ded84ec34f929327abc15de07c16
     SPOTIFY_CLIENT_SECRET=d1b022f6e5ac40df84235e5399616f8b
     ```

### 3. Si la Autenticación Falla
Si el test dice que la autenticación con Spotify falla (status 401/403):

1. Verifica que las credenciales son **exactamente correctas** desde tu panel de Spotify:
   - https://developer.spotify.com/dashboard
   - Client ID y Client Secret deben coincidir exactamente

2. Comprueba que tu aplicación Spotify está en estado válido:
   - No ha sido rechazada o desactivada
   - Los términos de servicio están aceptados

3. Prueba manualmente en tu local:
   ```bash
   # Reemplaza con tus credenciales
   curl -X POST https://accounts.spotify.com/api/token \
     -H "Authorization: Basic BASE64_CREDENTIALS" \
     -d "grant_type=client_credentials"
   ```

### 4. Buscar con Debug Activado
Para ver más detalles de los errores, prueba:
```
GET https://tu-dominio.com/api/music/search?q=test&debug=true
```

Esto mostrará los detalles exactos del error en la respuesta JSON.

## Cambios Realizados en el Código

### 1. **Mejor Logging** (`lib/music/spotify.ts`)
- Se añadió logging detallado en todas las operaciones
- Los logs aparecerán en los logs del servidor/consola
- Esto te ayuda a identificar exactamente dónde falla

### 2. **Endpoint de Diagnóstico** (`app/api/spotify-test/route.ts`)
- Nuevo endpoint que verifica todas las configuraciones
- No requiere credenciales especiales
- Puedes llamarlo públicamente para diagnosticar

### 3. **Mejor Manejo de Errores** 
- Los errores ahora incluyen más contexto
- Parámetro `debug=true` muestra detalles en la respuesta

## Verificación Local

Para verificar que funciona localmente:

1. Abre tu terminal en `wedding-app/`
2. Ejecuta:
   ```bash
   npm run dev
   ```
3. Prueba el endpoint de test:
   ```
   http://localhost:3000/api/spotify-test
   ```
4. Prueba una búsqueda:
   ```
   http://localhost:3000/api/music/search?q=test&debug=true
   ```

Ambos deberían devolver `status: 200` con `"status": "ok"` en todos los tests.

## Posibles Causas Comunes

### 🔴 "SPOTIFY_NOT_CONFIGURED"
Las variables de entorno no se encuentran en el servidor de producción.
- Solución: Verificar Environment Variables en tu plataforma (Vercel, etc.)

### 🔴 "SPOTIFY_TOKEN_ERROR"
Las credenciales son incorrectas o Spotify rechaza la autenticación.
- Solución: Verificar que las credenciales sean exactas en Spotify Dashboard

### 🔴 "SPOTIFY_SEARCH_ERROR"
Spotify rechaza la búsqueda (puede ser temporal).
- Solución: Reintentar, o revisar status de Spotify API

## Próximos Pasos

1. Corre el endpoint `/api/spotify-test` en producción
2. Comparte el resultado del test (sin exponer las credenciales)
3. Basándote en el error específico, implementa la solución

Con estos logs y diagnósticos, debería ser claro qué está fallando exactamente.

