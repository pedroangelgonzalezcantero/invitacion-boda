# Módulo de música · `/musica` y `/djMusica`

## Variables de entorno necesarias

Configura estas variables tanto en desarrollo como en producción:

```dotenv
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
DJ_MUSIC_TOKEN=...
```

### Dónde configurarlas

- Desarrollo: en tu `.env` o `.env.local`
- Producción: en las variables de entorno del hosting actual

## Rutas nuevas

### Invitados
- `/musica`

### DJ
- `/djMusica`

## APIs nuevas

- `GET /api/music/search?q=...`
- `POST /api/music/request`
- `GET /api/music/dj/queue`
- `GET /api/music/dj/history`
- `GET /api/music/dj/stats`
- `POST /api/music/dj/play`

## Base de datos

Se han añadido dos tablas aisladas al módulo:

- `music_queue_items`
- `music_requests`

No se han modificado las tablas existentes del proyecto.

## Flujo esperado

### Invitado
1. Entra en `/musica`
2. Busca en Spotify
3. Selecciona canción
4. Confirma la petición
5. Recibe feedback visual

### DJ
1. Entra en `/djMusica`
2. Introduce `DJ_MUSIC_TOKEN`
3. Gestiona la cola
4. Marca canciones como reproducidas
5. Consulta histórico y estadísticas

## Nota sobre Spotify

Si `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` no están configurados, la búsqueda devolverá un error controlado y la UI mostrará un mensaje amigable.

