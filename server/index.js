// index.js
import express from 'express';
import cors from 'cors';
import floorTrafficRouter from '../routes/floorTraffic.js';
import leadsRouter from '../routes/leads.js';
import usersRouter from '../routes/users.js';
import { startAdfIngestJob } from './jobs/adfIngestJob.js';

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

// Configure CORS so the React frontend hosted on Vercel can talk to this API
// when deployed to platforms like Render. By default we allow the production
// domain and any Vercel preview URLs. Additional domains can be supplied via
// the `CORS_ORIGINS` environment variable.
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Built-in middleware to parse JSON
app.use(express.json());

// Health-check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API routes
app.use('/api', floorTrafficRouter);
app.use('/api', leadsRouter);
app.use('/api', usersRouter);

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

// Start background jobs
startAdfIngestJob();
