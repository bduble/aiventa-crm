# Aiventa CRM

## Backend Setup

### FastAPI (Python)

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Express (Node.js)

```bash
npm install
npm start
```

### React (frontend)

```bash
cd frontend
npm install
npm run dev
```

Tailwind CSS is built locally using PostCSS, so running `npm install` will also
install the necessary dev dependencies (`tailwindcss`, `postcss` and
`autoprefixer`).

## Environment Variables

The FastAPI services expect `SUPABASE_URL` and `SUPABASE_KEY` to be set. `CORS_ORIGINS` controls the allowed origins for both servers. The React frontend looks for `VITE_API_BASE_URL`, `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`.

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
CORS_ORIGINS=https://aiventa-crm.vercel.app,https://aiventa-g3al310q6-brian-dubles-projects.vercel.app
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_KEY=<your-supabase-key>
```

Be sure to omit any trailing slashes from the origins.

## Using the Supabase API

When calling Supabase REST endpoints directly, include both the `apikey` and
`Authorization` headers. The value for each should be your `SUPABASE_KEY`.

```bash
curl -H "apikey: $SUPABASE_KEY" \
     -H "Authorization: Bearer $SUPABASE_KEY" \
     "https://<your-supabase-url>/rest/v1/floor_traffic_customers"
```

This ensures requests authenticate correctly and avoids 401/400 errors.
