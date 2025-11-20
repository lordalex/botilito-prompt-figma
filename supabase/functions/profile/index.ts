// supabase/functions/profile/index.ts
// Deno Edge Function: Handles CRUD operations for user profiles.
//
// PURPOSE: Provides secure endpoints for authenticated users to retrieve and
// update their own profile data stored in the 'perfiles_usuario' table.
// It explicitly prevents modification of critical fields like id, email, or password.

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.43.4";

// --- CORS Headers ---
// Define reusable CORS headers to allow cross-origin requests from web clients.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- Supabase Admin Client ---
// Initialize the Supabase client with the service role key for elevated privileges.
// This is necessary for operating on the 'perfiles_usuario' table securely.
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// --- Response Helper ---
// A utility function to create standardized JSON responses.
const send = (status: number, body: Record<string, unknown>) => {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
};

// --- Authentication Helper ---
// Extracts the JWT from the Authorization header and validates it to get the user.
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
  // Handle CORS pre-flight requests immediately.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- GET /profile ---
    // Retrieves a user profile.
    // If a `id` query param is provided, it fetches that specific user's profile.
    // Otherwise, it defaults to retrieving the profile for the authenticated user.
    if (req.method === 'GET') {
      const user = await getAuthenticatedUser(req);
      const url = new URL(req.url);
      const targetUserId = url.searchParams.get('id') || user.id;

      const { data: profile, error } = await supabaseAdmin
        .from('perfiles_usuario')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = "No rows found"
        console.error("Database error fetching profile:", error);
        return send(500, { error: "Could not fetch profile.", details: error.message });
      }

      if (!profile) {
        return send(404, { error: `Profile not found for user ${targetUserId}.` });
      }

      return send(200, { data: profile });
    }

    // --- PUT /profile ---
    // Updates (or creates) the profile for the authenticated user.
    if (req.method === 'PUT') {
      const user = await getAuthenticatedUser(req);
      const body = await req.json();

      // **SECURITY**: Define a whitelist of fields that are safe for a user to update.
      // This prevents them from changing their ID, email, role, password, etc.
      const allowedFields: (keyof typeof body)[] = [
        'nombre_completo',
        'numero_telefono',
        'departamento',
        'ciudad',
        'fecha_nacimiento'
      ];

      const profileDataToUpdate: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          profileDataToUpdate[field] = body[field];
        }
      }
      
      // Ensure there's actually something to update.
      if (Object.keys(profileDataToUpdate).length === 0) {
        return send(400, { error: "No valid fields provided for update." });
      }

      // Perform the 'upsert' operation. This will update the record if it exists
      // or create it if it doesn't, based on the user's ID.
      const { data: updatedProfile, error: upsertError } = await supabaseAdmin
        .from('perfiles_usuario')
        .upsert({
          id: user.id, // The user's ID is the primary key and link to auth.users.
          email: user.email, // Keep email in sync.
          ...profileDataToUpdate
        })
        .select()
        .single();

      if (upsertError) {
        console.error("Database error updating profile:", upsertError);
        return send(500, { error: "Could not update profile.", details: upsertError.message });
      }

      return send(200, { message: "Profile updated successfully.", data: updatedProfile });
    }

    // --- Fallback for other methods ---
    return send(405, { error: `Method ${req.method} not allowed.` });

  } catch (err) {
    console.error("An unexpected error occurred:", err);
    const status = typeof err === 'object' && err !== null && 'status' in err ? err.status as number : 500;
    const message = typeof err === 'object' && err !== null && 'message' in err ? err.message as string : "Internal Server Error";
    return send(status, { error: message });
  }
});
