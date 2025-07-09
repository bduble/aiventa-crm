// backend/app.js
const express = require('express');
const app     = express();
const cors    = require('cors');

app.use(express.json());

// Configure CORS using the same env variable as the FastAPI app and automatically
// include platform provided URLs (Vercel, Render) so deployments work without
// additional configuration.
function buildAllowedOrigins() {
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (process.env.VERCEL_URL) {
    envOrigins.push(`https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`);
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    envOrigins.push(`https://${process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '')}`);
  }

  return [...new Set(envOrigins.length ? envOrigins : ['*'])];
}

const allowedOrigins = buildAllowedOrigins();
app.use(
  cors({
    origin: (origin, cb) => {
      const allowAny = allowedOrigins.includes('*');
      if (
        !origin ||
        allowAny ||
        allowedOrigins.includes(origin) ||
        (origin.endsWith('.vercel.app') && allowedOrigins.some(o => o.endsWith('.vercel.app'))) ||
        (origin.endsWith('.onrender.com') && allowedOrigins.some(o => o.endsWith('.onrender.com')))
      ) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);  // configure with your CORS_ORIGINS

// Mount your new inventory router:
const inventoryRouter = require('./routes/inventory');
app.use('/api/inventory', inventoryRouter);

// Your existing floor-traffic router:
// const ftRouter = require('./routes/floor-traffic');
// app.use('/api/floor-traffic', ftRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
