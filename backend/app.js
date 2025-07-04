// backend/app.js
const express = require('express');
const app     = express();
const cors    = require('cors');

app.use(express.json());

// Configure CORS using the same env variable as the FastAPI app
const originsEnv = process.env.CORS_ORIGINS || 'https://aiventa-crm.vercel.app';
const allowedOrigins = originsEnv
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin) ||
          (origin.endsWith('.vercel.app') && allowedOrigins.some(o => o.endsWith('.vercel.app')))) {
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
