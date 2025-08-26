import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, firstName, lastName, role }: InvitationRequest = await req.json();

    console.log(`Enviando convite para: ${email}`);

    // Construct redirectTo dynamically - prefer production domain
    const origin = req.headers.get('origin') || 'https://sosmultasportoalegre.com.br';
    const redirectTo = `${origin}/auth`;

    console.log(`Redirect URL configurado: ${redirectTo}`);

    // Send invitation using Supabase's built-in method
    console.log(`Tentando enviar convite com os seguintes dados:`, {
      email,
      firstName,
      lastName,
      role,
      redirectTo
    });

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectTo,
      data: {
        first_name: firstName || '',
        last_name: lastName || '',
        role: role
      }
    });

    if (error) {
      console.error('Erro detalhado ao enviar convite:', {
        error: error,
        message: error.message,
        status: error.status,
        details: error
      });
      throw new Error(`Erro ao enviar convite: ${error.message}`);
    }

    console.log('Convite enviado com sucesso:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: data.user?.id,
      message: "Convite enviado com sucesso",
      redirect_url: redirectTo
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro na função send-invitation:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro interno do servidor" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);