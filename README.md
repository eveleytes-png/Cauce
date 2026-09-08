# Cauce

Next.js 15 (App Router) + TypeScript estricto + Tailwind CSS v4. Preparado para CI en Vercel desde GitHub.

## Desarrollo local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Scripts:

- `npm run dev` — servidor de desarrollo (Turbopack)
- `npm run build` — build de producción
- `npm run lint` / `npm run format` — ESLint + Prettier
- `npm run typecheck` — TypeScript sin emitir

## GitHub

```bash
git init
git add .
git commit -m "chore: initial Next.js 15 production scaffold"
git branch -M main
gh repo create cauce --private --source=. --remote=origin --push
```

Sin `gh`: crea el repositorio vacío en GitHub y luego:

```bash
git remote add origin https://github.com/<usuario>/cauce.git
git push -u origin main
```

No subas `.env.local`. Solo `.env.example` va al remoto.

## Vercel (CI en cada push a `main`)

1. Entra en [vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. **Add New… → Project** y selecciona el repo `cauce`.
3. Framework: Next.js (autodetectado). Root Directory: `.`
4. En **Environment Variables**, copia las claves de `.env.example` (Production, Preview y Development).
5. Deploy. Vercel creará un deployment por cada push a `main` y por cada PR (Preview).

CLI opcional:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
```
