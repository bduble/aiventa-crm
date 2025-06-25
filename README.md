# Aiventa CRM

## Backend Setup

### FastAPI (Python)

From the project root:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The `backend/` folder is obsolete and not used.

### Express (Node.js)

```bash
npm install
npm start
```

## Environment Variables

The FastAPI services expect `SUPABASE_URL` and `SUPABASE_KEY` to be
available. Create a `.env` file in the project root:

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
CORS_ORIGINS=https://aiventa-crm.vercel.app
```
