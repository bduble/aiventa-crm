import { createClient } from '@supabase/supabase-js';

// Some environments accidentally include the PostgREST path (e.g. `/rest/v1`)
// in the Supabase URL which results in requests hitting
// `<project-url>/rest/v1/rest/v1/...` and returning 404s.  Strip the extra
// path if it exists so the client always receives the root project URL.
const rawUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");

const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default supabase;
