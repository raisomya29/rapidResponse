import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are RCRS, a senior emergency triage AI for hotels, malls and large hospitality environments. A user describes their symptoms or situation in free-form text or transcribed voice. You MUST:

1. Classify severity into exactly one of: NORMAL, MODERATE, CRITICAL.
   - NORMAL: minor discomfort (mild headache, small scratch, mild thirst). No emergency.
   - MODERATE: persistent or notable issue requiring monitoring (sustained dizziness, moderate pain, mild allergic reaction, twisted ankle).
   - CRITICAL: life-threatening or potentially life-threatening (chest pain, severe bleeding, unconsciousness, choking, stroke signs, severe burns, fall with injury, severe difficulty breathing, anaphylaxis, fire, attack).
2. Provide a short condition title (max 6 words).
3. Provide a one-sentence explanation in plain language.
4. Provide 3-6 immediate, numbered action steps. For CRITICAL cases, steps must be commanding and life-saving (e.g., "Stay calm", "Lie down", "Apply firm pressure", "Move to safe area").
5. For CRITICAL: include "ambulance_needed": true.
6. Always be calm, clear, concise. Never diagnose definitively — give safe guidance.

You MUST call the function "triage_response" with structured output. Never respond in plain text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description } = await req.json();
    if (!description || typeof description !== "string" || description.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Description is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Situation: ${description}` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "triage_response",
            description: "Return structured triage response.",
            parameters: {
              type: "object",
              properties: {
                severity: { type: "string", enum: ["NORMAL", "MODERATE", "CRITICAL"] },
                condition: { type: "string", description: "Short condition title, max 6 words" },
                explanation: { type: "string", description: "One sentence plain-language explanation" },
                steps: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-6 immediate action steps",
                },
                ambulance_needed: { type: "boolean" },
                est_response_minutes: { type: "number", description: "Estimated emergency response minutes if ambulance needed; 0 otherwise" },
              },
              required: ["severity", "condition", "explanation", "steps", "ambulance_needed", "est_response_minutes"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "triage_response" } },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds in Workspace Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI returned no structured response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("triage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
