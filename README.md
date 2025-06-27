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

## Environment Variables

The FastAPI services expect `SUPABASE_URL` and `SUPABASE_KEY` to be set. `CORS_ORIGINS` controls the allowed origins for both servers.

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
CORS_ORIGINS=https://aiventa-crm.vercel.app,https://aiventa-g3al310q6-brian-dubles-projects.vercel.app
```

Be sure to omit any trailing slashes from the origins.
