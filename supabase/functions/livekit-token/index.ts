import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TokenRequest {
  roomName?: string;
  participantName?: string;
  getServerUrl?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LIVEKIT_API_KEY");
    const apiSecret = Deno.env.get("LIVEKIT_API_SECRET");
    const livekitUrl = Deno.env.get("LIVEKIT_URL");

    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error("Missing LiveKit configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: TokenRequest = await req.json();

    if (body.getServerUrl) {
      return new Response(
        JSON.stringify({ serverUrl: livekitUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { roomName, participantName } = body;

    if (!roomName || !participantName) {
      return new Response(
        JSON.stringify({ error: "Room name and participant name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const header = {
      alg: "HS256",
      typ: "JWT",
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 6; // 6 hours

    const payload = {
      exp,
      iss: apiKey,
      nbf: now,
      sub: participantName,
      video: {
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    };

    const encoder = new TextEncoder();

    function base64UrlEncode(data: Uint8Array): string {
      const base64 = btoa(String.fromCharCode(...data));
      return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    const headerEncoded = base64UrlEncode(encoder.encode(JSON.stringify(header)));
    const payloadEncoded = base64UrlEncode(encoder.encode(JSON.stringify(payload)));

    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signatureInput)
    );

    const signatureEncoded = base64UrlEncode(new Uint8Array(signature));
    const token = `${signatureInput}.${signatureEncoded}`;

    console.log("Token generated for:", participantName, "in room:", roomName);

    return new Response(
      JSON.stringify({ token, serverUrl: livekitUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Token generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate token" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});