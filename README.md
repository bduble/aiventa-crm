# Aiventa CRM

## Backend Setup

### FastAPI (Python)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
uvicorn app.main:app --reload --port 8000
```

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

Both API servers read `CORS_ORIGINS` (comma separated) to control which
domains may access the APIs. Set it to your deployed frontend URL.  They
also respect `PORT` if you wish to customize the port number.
