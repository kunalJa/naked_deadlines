import { createClient } from '@supabase/supabase-js';

// This file is only used on the server side
// These environment variables are not exposed to the client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
