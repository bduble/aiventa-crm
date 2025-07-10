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

Both the Node and FastAPI servers automatically append deployment URLs exposed by
platforms like Vercel (`VERCEL_URL`) or Render (`RENDER_EXTERNAL_URL`). In most
cases setting `CORS_ORIGINS` to your production domain is sufficient and preview
deployments will be permitted out of the box. Alternatively you can set
`FRONTEND_URL` and it will automatically be added to the allowed origins.

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
CORS_ORIGINS=https://aiventa-crm.vercel.app,https://aiventa-g3al310q6-brian-dubles-projects.vercel.app
FRONTEND_URL=https://aiventa-crm.vercel.app
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_KEY=<your-supabase-key>
OPENAI_API_KEY=<your-openai-key>
TWILIO_ACCOUNT_SID=<twilio-account-sid>
TWILIO_API_KEY_SID=<twilio-api-key-sid>
TWILIO_API_KEY_SECRET=<twilio-api-key-secret>
TWIML_APP_SID=<twiml-app-sid>
TWILIO_AUTH_TOKEN=<twilio-auth-token>
```

Be sure to omit any trailing slashes from the origins.

If `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are not provided, the
floor-traffic page will automatically fall back to fetching data from the API
server at `/api/floor-traffic`.

## Telephony Integration

With Twilio credentials configured, the backend exposes simple endpoints for
voice and SMS callbacks. Use `/api/telephony/token` to obtain a WebRTC token for
your browser client. Configure your Twilio number webhooks to point at
`/api/telephony/voice` for calls and `/api/telephony/sms` for incoming text
messages.

## Using the Supabase API

When calling Supabase REST endpoints directly, include both the `apikey` and
`Authorization` headers. The value for each should be your `SUPABASE_KEY`.

```bash
curl -H "apikey: $SUPABASE_KEY" \
     -H "Authorization: Bearer $SUPABASE_KEY" \
     "https://<your-supabase-url>/rest/v1/floor_traffic_customers"
```

This ensures requests authenticate correctly and avoids 401/400 errors.
