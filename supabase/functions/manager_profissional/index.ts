// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  // Verifica usuário autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verifica se o user é admin (tabela profissionais)
  const { data: profissional, error: profError } = await supabase
    .from("profissionais")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profError || profissional?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const method = req.method;
  const url = new URL(req.url);

  switch (method) {
    case "GET": {
      const { data, error } = await supabase.from("profissionais").select("*");
      if (error) return new Response(error.message, { status: 500 });
      return new Response(JSON.stringify(data), { status: 200 });
    }

    case "POST": {
      const body = await req.json();
      const { user_id, nome, role } = body;

      const { data, error } = await supabase.from("profissionais").insert([
        { user_id, nome, role },
      ]);

      if (error) return new Response(error.message, { status: 400 });
      return new Response(JSON.stringify(data), { status: 201 });
    }

    case "PUT": {
      const body = await req.json();
      const { id, ...updates } = body;

      const { error } = await supabase
        .from("profissionais")
        .update(updates)
        .eq("id", id);

      if (error) return new Response(error.message, { status: 400 });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    case "DELETE": {
      const { id } = await req.json();

      const { error } = await supabase.from("profissionais").delete().eq("id", id);

      if (error) return new Response(error.message, { status: 400 });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    default:
      return new Response("Método não suportado", { status: 405 });
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/manager_profissional' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
