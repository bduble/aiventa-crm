import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY; // prefer service role

let supabase;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn('Supabase credentials not configured; using mock client');
  const stub = {};
  const chain = () => stub;
  Object.assign(stub, {
    select: chain,
    insert: chain,
    update: chain,
    delete: chain,
    eq: chain,
    gte: chain,
    lte: chain,
    ilike: chain,
    maybe_single: chain,
    single: () => ({ data: null, error: new Error('Supabase not configured') }),
    execute: () => ({ data: [], error: new Error('Supabase not configured') })
  });
  supabase = { from: () => stub };
}

export default supabase;
