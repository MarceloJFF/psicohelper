import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const planos = [
    {
      "idFront": 1,
      "nome": "Plano Anamnese",
      "idBack": "142a4b19-41dd-4f30-847c-b6c124caed9e"
    },
    {
      "idFront": 2,
      "nome": "Plano Piaget",
      "idBack": "3ad71fa8-aee9-40da-b129-917b503d74b7"
    },
    {
      "idFront": 3,
      "nome": "Plano Wallon",
      "idBack": "cea22366-49e8-4e88-af60-89590bbfdd8e"
    }
  ];

  // Create admin client with service role key
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Create regular client for user operations
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const roleAdmin = "ADMIN_CONTROLADOR_GLOBAL";
  
  // Get the admin user from the request
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }
  
  const { data: profissional, error: profError } = await supabaseAdmin
    .from("tb_profissional")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (profError || profissional?.role !== roleAdmin) {
    return new Response("Forbidden", {
      status: 403,
      headers: corsHeaders,
    });
  }

  const method = req.method;

  switch (method) {
    case "GET": {
      const { data, error } = await supabaseAdmin
        .from('vw_profissional_admin_completo_')
        .select('*')
      if (error) {
        return new Response(error.message, {
          status: 500,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    case "POST": {
      try {
        const body = await req.json();
        const { email, senha, nome, profissao, telefone, expiracao, idPlano } = body;

        const planoEncontrado = planos.find(plano => plano.idFront === idPlano);

        // Use admin client to create user
        const accountData = await criarConta(email, senha);
        const profissionais = await criarProfissional(nome, profissao, telefone, accountData);
        if (!profissionais || profissionais.length === 0) {
          throw new Error("Failed to create professional");
        }

        await criarConfiguracaoContaProfissional(profissionais[0].id);
        await criarAssinatura(profissionais[0].id, expiracao, planoEncontrado?.idBack);

        return new Response(JSON.stringify(profissionais[0]), {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(error.message, {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    case "PUT": {
      try {
        const body = await req.json();
        const { id, nome, profissao, telefone, dataExpiracao, idPlano, ativo } = body;

        // Update professional
        const { error: profError } = await supabaseAdmin
          .from("tb_profissional")
          .update({
            nome,
            profissao,
            telefone,
            status_prof: ativo
          })
          .eq("id", id);

        if (profError) throw profError;

        // Update subscription if provided
        if (dataExpiracao && idPlano) {
          const planoEncontrado = planos.find(plano => plano.idFront === idPlano);
          const { error: assinaturaError } = await supabaseAdmin
            .from("tb_assinatura")
            .update({
              data_expiracao: dataExpiracao,
              id_plano: planoEncontrado?.idBack,
              ativo
            })
            .eq("id_profissional", id);

          if (assinaturaError) throw assinaturaError;
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(error.message, {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    default:
      return new Response("Método não suportado", {
        status: 405,
        headers: corsHeaders,
      });
  }

  // Suas funções auxiliares abaixo também permanecem iguais,
  // mas sempre que usar Response, inclua os headers, se necessário.

  async function criarAssinatura(idProfissional, dataExpiracao, idPlano) {
    const { data, error } = await supabaseAdmin.from("tb_assinatura").insert([
      {
        'id_profissional': idProfissional,
        'id_plano': idPlano,
        'data_expiracao': dataExpiracao,
        ativo: true
      }
    ]).select();

    if (error) throw error;
    if (!data) throw new Error("Failed to create assinatura");
    return data;
  }

  async function criarProfissional(nome, profissao, telefone, accountData) {
    const { data, error } = await supabaseAdmin.from("tb_profissional").insert([
      {
        'nome': nome,
        'profissao': profissao,
        'telefone': telefone,
        'status_prof': true,
        'id': accountData.id
      }
    ]).select();
    if (error) throw error;
    if (!data) throw new Error("Failed to create professional");
    return data;
  }

  async function criarConfiguracaoContaProfissional(idProfissional) {
    const { data, error } = await supabaseAdmin
      .from('tb_config')
      .insert([{ id_profissional: idProfissional }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function criarConta(email, password) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (error) throw error;
    return data.user;
  }
});



