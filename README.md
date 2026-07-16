# Sal Sin Miedo

Repositorio organizado por aplicaciones:

- `front/`: aplicación Angular.
- `back/`: backend Next.js (App Router).

## Desarrollo

Ejecuta cada aplicación en una terminal independiente:

```bash
cd front
npm start
```

```bash
cd back
npm run dev
```

El frontend se sirve en `http://localhost:4200` y el backend en `http://localhost:3000`.

Para los contenedores de producción:

```bash
docker compose up --build
```

Quedarán disponibles en `http://localhost:8080` (frontend) y `http://localhost:3000` (backend).
