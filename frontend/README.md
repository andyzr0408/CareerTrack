# CareerTrack: frontend (React + Vite)

Pantallas de inicio de sesión, registro, panel del profesional, panel de la empresa y administración. Todo el contenido llega de la API de Laravel (`backend/`); no hay datos de ejemplo en el código.

## Puesta en marcha
1. Deja el backend corriendo: `php artisan serve` dentro de `backend/` (puerto 8000).
2. En esta carpeta:
```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8000/api
npm run dev              # http://localhost:5173
```
Si cambias el puerto o el dominio del frontend, ajusta `FRONTEND_URL` en `backend/.env` (CORS).

## Cómo se conecta con la API
- `src/lib/api.js`: cliente `fetch` con el token Bearer, errores de validación por campo y cierre de sesión si el token vence.
- `src/hooks/usePaginated.js`: pide cada lista por páginas (`?page=2&per_page=6`), vuelve a la página 1 cuando cambian los filtros y retrocede si la página queda vacía.
- `src/components/Pagination.jsx` y `PagedList.jsx`: controles de página y estados de carga, error y vacío.
- Los filtros, la búsqueda y el orden se mandan al backend como parámetros; la búsqueda espera 350 ms después de la última tecla.

Contrato completo de rutas y respuestas: `docs/api.md` en la raíz del repositorio.

## Cuentas de prueba
Todas con la clave `password`: `profesional@careertrack.test`, `empresa@careertrack.test`, `admin@careertrack.test`.
