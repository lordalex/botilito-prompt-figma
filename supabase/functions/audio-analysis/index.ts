// supabase/functions/audio-analysis/index.ts
// Deno Edge Function: Handles audio submission for analysis.

import { createClient } from "npm:@supabase/supabase-js@2.43.4";
import { Buffer } from "https://deno.land/std@0.177.0/node/buffer.ts";


// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- Supabase Admin Client ---
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// --- Response Helper ---
const send = (status: number, body: Record<string, unknown> | unknown[]) => {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
};

// --- Authentication Helper ---
const getAuthenticatedUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw { status: 401, message: "Missing Authorization header." };
  }
  const jwt = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(jwt);
  if (error || !user) {
    throw { status: 401, message: "Invalid or expired JWT." };
  }
  return user;
};

// --- Main Server Logic ---
Deno.serve(async (req: Request) => {
  // Handle CORS pre-flight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace('/functions/v1/audio-analysis', '');

  try {
    // --- POST /submit ---
    // Submits a new audio file for analysis.
    if (req.method === 'POST' && path === '/submit') {
      const user = await getAuthenticatedUser(req);
      const body = await req.json();
      const { audio_base64 } = body;

      if (!audio_base64) {
        return send(400, { error: "Missing audio_base64 in request body." });
      }
      
      // **FIX**: Check if the user object is valid before accessing its properties.
      // This prevents the "Cannot read properties of null (reading 'id')" error
      // if the JWT is valid but the user cannot be retrieved.
      if (!user || !user.id) {
        return send(401, { error: "Could not identify user from token." });
      }

      // Here you would typically calculate a hash of the audio,
      // check for duplicates, and then insert the job.
      // This is a simplified version focusing on the fix.

      const { data: newJob, error: insertError } = await supabaseAdmin
        .from('analysis_jobs')
        .insert({
          user_id: user.id, // Now safe to access user.id
          status: 'processing',
          payload_type: 'audio',
          // other fields would go here
        })
        .select()
        .single();

      if (insertError) {
        console.error("Database error creating analysis job:", insertError);
        return send(500, { error: "Could not create analysis job.", details: insertError.message });
      }

      // In a real implementation, you would now trigger the analysis engine.
      // For this example, we'll just return the job ID.
      return send(202, { job_id: newJob.id, status: 'processing' });
    }

    // --- GET /status/:id ---
    // (Placeholder for status check endpoint)
    if (req.method === 'GET' && path.startsWith('/status/')) {
        const id = path.split('/')[2];
        // Logic to check job status would go here
        return send(200, { job_id: id, status: "not_implemented" });
    }

    // --- Fallback for other methods/paths ---
    return send(404, { error: "Not Found" });

  } catch (err) {
    console.error("An unexpected error occurred:", err);
    const status = typeof err === 'object' && err !== null && 'status' in err ? err.status as number : 500;
    const message = typeof err === 'object' && err !== null && 'message' in err ? err.message as string : "Internal Server Error";
    return send(status, { error: message });
  }
});
