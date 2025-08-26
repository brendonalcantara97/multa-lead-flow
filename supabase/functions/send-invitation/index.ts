import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";

    // Create the user in Supabase Auth
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        role: role,
        is_temp_password: true
      }
    });

    if (signUpError) {
      console.error('Erro ao criar usuário:', signUpError);
      throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
    }

    console.log(`Usuário criado com sucesso: ${user.user?.id}`);

    // Send invitation email
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'Usuário';
    const roleText = role === 'admin' ? 'Administrador' : 
                    role === 'manager' ? 'Gerente' : 'Usuário';

    const emailResponse = await resend.emails.send({
      from: "SOS Multas <onboarding@resend.dev>",
      to: [email],
      subject: "Convite para acessar o Sistema SOS Multas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ea580c; margin-bottom: 10px;">SOS Multas</h1>
            <p style="color: #666; font-size: 16px;">Sistema de Gestão de Leads</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-bottom: 15px;">Olá, ${fullName}!</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
              Você foi convidado para acessar o sistema SOS Multas como <strong>${roleText}</strong>.
            </p>
            <p style="color: #555; line-height: 1.6;">
              Suas credenciais de acesso são:
            </p>
          </div>
          
          <div style="background: #fff; border: 2px solid #ea580c; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 15px 0;"><strong>Senha temporária:</strong> <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${tempPassword}</code></p>
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                ⚠️ <strong>Importante:</strong> Por segurança, você será obrigado a alterar esta senha no primeiro acesso.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="https://sosmultasportoalegre.com.br/auth" 
               style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Acessar Sistema
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Este convite foi enviado pelo administrador do sistema SOS Multas.</p>
            <p>Se você não solicitou este acesso, pode ignorar este email com segurança.</p>
          </div>
        </div>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: user.user?.id,
      temp_password: tempPassword,
      message: "Convite enviado com sucesso" 
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