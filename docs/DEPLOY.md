# Deploy VedaAI (full stack)

VedaAI needs **four** pieces in production:

| Component | Role |
|-----------|------|
| **Web** (Next.js) | UI |
| **API** (Express + Socket.IO) | REST + realtime |
| **Worker** (BullMQ) | Gemini paper generation — **must run separately** |
| **MongoDB + Redis** | Data + job queue |

Recommended hosted databases (free tiers):

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Upstash Redis](https://upstash.com/) — enable TLS; use the `rediss://` URL

---

## Option A — Render (recommended, no Docker)

### 1. Push code to GitHub

```bash
git init
git add .
git commit -m "Prepare VedaAI for deployment"
git remote add origin https://github.com/YOUR_USER/VedaAI.git
git push -u origin main
```

### 2. Create databases

1. **Atlas:** create cluster → Database → Connect → Drivers → copy connection string. Replace `<password>` and set database name `vedaai`.
2. **Upstash:** create Redis database → copy the **Redis URL** (`rediss://...`).

### 3. Deploy on Render

1. Go to [render.com](https://render.com) → **New** → **Blueprint** → connect your repo.
2. Render reads `render.yaml` and creates **vedaai-api**, **vedaai-worker**, **vedaai-web**.
3. Set environment variables (Dashboard → each service → **Environment**):

**vedaai-api**

| Key | Value |
|-----|--------|
| `MONGODB_URI` | Atlas connection string |
| `REDIS_URL` | Upstash URL |
| `GEMINI_API_KEY` | Your Gemini key |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `MOCK_AI` | `false` |
| `WEB_URL` | `https://vedaai-web.onrender.com` (update after web is live) |

**vedaai-worker** — same as API (no `PORT` needed).

**vedaai-web**

| Key | Value |
|-----|--------|
| `VEDAAI_API_URL` | `https://vedaai-api.onrender.com` |
| `NEXT_PUBLIC_API_URL` | `https://vedaai-api.onrender.com` |

> `NEXT_PUBLIC_API_URL` is baked in at **build** time. After changing it, trigger **Manual Deploy** on the web service.

4. Deploy order: wait for **API** → set **WEB_URL** on API to your web URL → deploy **worker** → deploy **web**.
5. Open the web URL → create an assignment → confirm the worker logs show generation.

### 4. Verify

- API health: `https://vedaai-api.onrender.com/health` → `{"ok":true}`
- Worker: Render → **vedaai-worker** → **Logs** (should stay running, no crash loop)
- Create assignment → status should move from queued → generating → completed

---

## Option B — Docker Compose (VPS or local server)

Requires [Docker](https://docs.docker.com/get-docker/) on the machine.

### 1. Configure env

```bash
cp .env.production.example .env
# Edit .env: GEMINI_API_KEY, WEB_URL, NEXT_PUBLIC_API_URL
```

For a VPS, set:

```env
WEB_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Use Atlas + Upstash in `.env` instead of local `mongo`/`redis` services, or keep the bundled containers for a single-server demo.

### 2. Build and run

```bash
docker compose --env-file .env up -d --build
```

- Web: http://localhost:3000  
- API: http://localhost:4000  

### 3. Production on a VPS

1. Point DNS: `yourdomain.com` → web, `api.yourdomain.com` → API (ports 3000 / 4000, or put **Caddy/nginx** in front).
2. Use HTTPS (Caddy auto-TLS is simplest).
3. Ensure firewall allows 80/443 only; do not expose Mongo/Redis publicly if using local containers.

---

## Option C — Split platforms

| Service | Platform |
|---------|----------|
| Web | [Vercel](https://vercel.com) — root `apps/web`, env `NEXT_PUBLIC_API_URL` |
| API + Worker | Render / Railway / Fly.io |
| MongoDB | Atlas |
| Redis | Upstash |

Vercel cannot run the BullMQ worker or long-lived Socket.IO server — keep API + worker on a Node host.

---

## Environment reference

See `.env.production.example` and `apps/api/.env.example`.

| Variable | Required | Notes |
|----------|----------|--------|
| `WEB_URL` | Yes (API) | Exact origin of the web app (CORS + Socket.IO) |
| `NEXT_PUBLIC_API_URL` | Yes (web build) | Public API URL, no trailing slash |
| `MONGODB_URI` | Yes | Atlas or `mongodb://mongo:27017/vedaai` in Compose |
| `REDIS_URL` | Yes | Must support pub/sub (Upstash works) |
| `GEMINI_API_KEY` | Yes* | *Optional if `MOCK_AI=true` |
| `MOCK_AI` | No | `true` for demos without Gemini |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Jobs stay **queued** | Worker not running or wrong `REDIS_URL` |
| CORS / socket errors | `WEB_URL` must match the browser origin exactly (scheme + host) |
| Web calls wrong API | Rebuild web after changing `NEXT_PUBLIC_API_URL` |
| PDF upload fails on API | Use Node 20+; `pdf-parse@1.1.1` is pinned for compatibility |
| Render free tier sleeps | First request after idle is slow; upgrade plan or use a VPS |

---

## Build commands (CI / manual)

```bash
npm ci
npm run build -w @vedaai/shared
npm run build -w @vedaai/api
NEXT_PUBLIC_API_URL=https://your-api.example.com npm run build -w @vedaai/web
```

Run API: `npm run start -w @vedaai/api`  
Run worker: `npm run start:worker -w @vedaai/api`  
Run web: `npm run start -w @vedaai/web`
