// index.js
import express from 'express';
import cors from 'cors';
import floorTrafficRouter from './routes/floorTraffic.js';

const app = express();

// Allow requests from configured origins
const originsEnv = process.env.CORS_ORIGINS || 'https://aiventa-crm.vercel.app';
const allowedOrigins = originsEnv
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Support wildcard subdomains for Vercel preview URLs
function isOriginAllowed(origin) {
  if (!origin) return true; // allow same-origin or non-browser requests
  if (allowedOrigins.includes(origin)) return true;
  return allowedOrigins.some(o =>
    o.endsWith('.vercel.app') && origin.endsWith('.vercel.app')
  );
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','OPTIONS'],
}));

// Built-in middleware to parse JSON
app.use(express.json());

// Health-check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount floor-traffic routes under /api
app.use('/api', floorTrafficRouter);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
