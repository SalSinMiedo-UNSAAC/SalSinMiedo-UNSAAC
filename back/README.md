# Backend — Sal Sin Miedo

Backend en Next.js (App Router) para el frontend Angular ubicado en `../front`.

## Desarrollo

```bash
cd back
npm run dev
```

El chequeo de salud queda disponible en `GET http://localhost:3000/api/health`.

## Autenticación y base de usuarios

La base PostgreSQL `users-db` está separada de las futuras bases de datos del negocio. Copia `../.env.example` a `../.env` antes de iniciar Docker. Para desarrollo local, ajusta `DATABASE_URL` en `.env` y ejecuta:

```bash
npm run db:migrate -- --name init_users
```

Endpoints para Angular (usa `withCredentials: true`):

- `POST /api/auth/register` con `{ "email", "password" }`
- `POST /api/auth/login` con `{ "email", "password" }`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Las contraseñas se derivan con `scrypt` y un salt aleatorio por usuario; la aplicación nunca guarda la contraseña original. La sesión se guarda en la BD y el navegador solo recibe un token opaco en una cookie `HttpOnly`.

## Organización

- `src/app/api`: Route Handlers HTTP consumibles por Angular.
- `src/app/actions`: Server Actions para futuras pantallas React/Next que pertenezcan al backend.
- `src/lib`: lógica de dominio reutilizable por ambas capas.

Server Actions no son una API pública para Angular. Para operaciones iniciadas desde `front`, crea un Route Handler en `src/app/api` y reutiliza ahí la misma lógica de `src/lib`.
