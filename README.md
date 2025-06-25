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

## Environment Variables

The FastAPI services expect `SUPABASE_URL` and `SUPABASE_KEY` to be
available. Create a `.env` file in the project root:

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
```

The Express server reads `CORS_ORIGIN` and `PORT` if you wish to
customize the allowed frontend origin or port number.
