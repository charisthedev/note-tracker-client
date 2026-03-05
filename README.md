# Notes App Client

Mini Vue 3 client for a notes API, using:
- `@tanstack/vue-query` for server state
- `vee-validate` + `zod` for form validation

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Environment

`.env` values:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

The app expects these API routes:
- `GET /notes`
- `POST /notes`
- `PUT /notes/:id`

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm preview`
- `pnpm typecheck`
