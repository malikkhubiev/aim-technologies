# Retail AiM MVP

## Quick start
1. Python 3.10+
2. Optional: Create `.env` (if missing, safe fallbacks are used):
```
YA_FOLDER_ID=
YA_OAUTH_TOKEN=
YA_IAM_TOKEN=
YA_SPEECHKIT_API_KEY=
YDB_ENDPOINT=grpcs://ydb.serverless.yandexcloud.net:2135
YDB_DATABASE=/ru-central1/b1.../etn...
YDB_SERVICE_ACCOUNT_KEY_FILE=
RECOMMENDER_TOP_K=3
```
3. Install and run backend
```
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. Frontend (React + Vite + Tailwind) UI (luxury dark theme)
```
cd frontend
npm i
npm run dev  # dev server on 5173 with proxy to backend
npm run build  # outputs static bundle into app/static
```

## API
- Health: `GET /health`
- JAICP webhook: `POST /jaicp/webhook`
- Recommender: `POST /recommend/query` body `{ "query": "Хочу ноутбук для игр" }`
- TTS demo: `POST /jaicp/tts` body `{ "text": "Здравствуйте!" }` returns hex of WAV (mock if offline)
- STT: `POST /jaicp/stt` accepts audio bytes or `{ audio_hex }`
- Interactions history: `GET /jaicp/history?limit=20`

### Running without .env
- If `.env` is absent or env vars are not set:
  - YDB is disabled → in-memory history store is used.
  - SpeechKit is disabled → TTS returns silent WAV, STT returns empty string.
  - Recommender uses local `app/data/products.json`.
  - All endpoints remain available and safe.

## Infra
- YDB schema: `infra/ydb_init.sql`
- DataLens guide: `infra/datalens_example.md`

### YDB init
1. Create Serverless YDB database (free-tier).
2. Set `YDB_ENDPOINT` and `YDB_DATABASE` in `.env`.
3. Run the schema in `infra/ydb_init.sql` using YDB Console or the SDK.
4. If YDB is not configured or unavailable, the service will store interactions in memory (for demo only).

### JAICP webhook
1. In JAICP, set webhook URL to `https://<your-host>/jaicp/webhook`.
2. Forward call/chat payloads; the service logs interactions into YDB.
3. Payload is resilient: fields like `channel`, `userPhone`/`phone`, `intent`/`question`, `result.status`, `sale`, `amount` are parsed when present.

### Deploy to Yandex Cloud Boost
- Minimal runtime: 256MB, 1 vCPU, Python 3.10, outbound internet.
- Expose port 8000. Health check: `/health`.
- Provide `.env` via YC secrets or environment vars.
- Build static frontend and serve from `/` (already mounted).
 - Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

Steps:
1. Build frontend: `cd frontend && npm ci && npm run build`
2. Deploy container or function with the backend and `app/static` contents.
3. Set env vars: `YA_*`, `YDB_*` as needed. Without them, fallbacks work.

### Security & fallbacks
- No secrets in code. Configure via environment variables or `.env` loaded by `pydantic`.
- SpeechKit calls use API Key or IAM Token; if missing or failing, TTS returns a short silent WAV, STT returns empty string.
- Webhook and APIs handle missing fields gracefully.
- CORS is enabled for demo. Restrict origins in production.

### Frontend UI/UX
- Dark luxury theme using CSS variables in `frontend/src/styles.css`:
  - `--bg`, `--panel`, `--text`, `--muted`, `--line`, `--accent`
- Pages & routing (lazy-loaded): Dashboard, Analytics, Recommendations, Voice, 404
- Features:
  - Dashboard: KPIs, mini charts, interaction table from `/jaicp/history`
  - Analytics: intent distribution, success vs failed, sales trend
  - Recommendations: search → `/recommend/query`
  - Voice: TTS `/jaicp/tts`, STT `/jaicp/stt`, status pills, webhook logging
- Accent override supported: set `--accent: #38e07b` in `:root`.

## Frontend demo
Static files served at `/`. Open `http://localhost:8000/` to use all four pages.

### Mock/Real toggle (DeepSeek demo)
- Location: top navigation bar on every page.
- Control: switch labeled "Mock" with indicator "Mode: Mock" or "Mode: Real".
- Persistence: stored in `localStorage` and remembered between sessions.
- Instant switching: pages refetch automatically; no full reloads.

#### Enable Mock mode
- Click the "Mock" switch so it turns on. The indicator will show `Mode: Mock`.
- While ON, the frontend reads from JSON fixtures instead of the backend.

#### Mock data files
- `frontend/src/mocks/history.json` → Dashboard and Analytics
- `frontend/src/mocks/recommendations.json` → Recommendations
- `frontend/src/mocks/tts.json` → Voice synthesis (base64 WAV)
- `frontend/src/mocks/stt.json` → Voice recognition (transcript)

Notes:
- Mock files are loaded via dynamic imports to keep the initial bundle small.
- Type mappings ensure consistent shapes with the real API:
  - History: fields adapted (`id`→`interaction_id`, `user`→`customer_phone`, `deal`→`sale`, `timestamp`→`created_at`).
  - Products: converts percent integers (`discount`, `margin`) to fractions expected by UI.

#### Demo without backend
- Start only the frontend: `cd frontend && npm i && npm run dev`.
- Toggle Mock ON. All screens will operate using the local mock data.
