import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const connectingIp = req.headers.get('cf-connecting-ip');
    
    // Try to get the most accurate IP
    let clientIp = connectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';
    
    // Clean up the IP (remove port if present)
    clientIp = clientIp.trim().split(':')[0];
    
    console.log('🌐 Client IP captured:', clientIp);
    console.log('📋 Headers:', {
      'x-forwarded-for': forwardedFor,
      'x-real-ip': realIp,
      'cf-connecting-ip': connectingIp
    });

    return new Response(
      JSON.stringify({ 
        ip_address: clientIp,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  } catch (error) {
    console.error('Error in capture-lead-info function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        ip_address: 'unknown'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});