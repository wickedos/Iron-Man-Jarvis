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
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('n8n webhook URL not configured');
    }

    console.log('Sending message to n8n webhook:', message);

    const webhookPayload = {
      message,
      conversationHistory,
      timestamp: new Date().toISOString(),
      source: 'jarvis-voice-assistant'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      throw new Error(`n8n webhook error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    console.log('n8n webhook response:', responseData);

    // Extract the AI response from the webhook response
    const aiResponse = responseData.response || responseData.message || 
                      responseData.output || "I've processed your request, sir.";

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true,
        data: responseData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('n8n webhook error:', error);
    
    // Fallback response if webhook fails
    const fallbackResponses = [
      "I'm experiencing connectivity issues, but I'm still here to assist you, sir.",
      "There seems to be a temporary issue with my processing systems. How may I help you?",
      "I'm having trouble connecting to my backend systems, but I remain at your service.",
      "My external processing is temporarily unavailable, but I can still assist you."
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        success: false,
        error: error.message,
        fallback: true
      }),
      {
        status: 200, // Return 200 to allow graceful fallback
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});