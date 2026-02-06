import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ToolDefinition {
  type: string;
  props: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, gestureEvent } = await req.json();
    const TAMBO_AI_KEY = Deno.env.get("TAMBO_AI_KEY") || Deno.env.get("LOVABLE_API_KEY");

    if (!TAMBO_AI_KEY) {
      throw new Error("TAMBO_AI_KEY is not configured");
    }

    const systemPrompt = `You are Tambo AI, an advanced meeting assistant that generates interactive UI tools based on conversation context, voice transcripts, and gestures.

AVAILABLE TOOLS - You can generate any of these based on context:

**PRODUCTIVITY TOOLS:**
- timer: Countdown or stopwatch
  Props: { initialSeconds: number, mode: "countdown" | "stopwatch", autoStart: boolean }
  Use when: Someone mentions time limits, segments, breaks, countdowns
  
- actionItem: Task card with assignee
  Props: { title: string, assignee?: string, dueDate?: string, priority: "low" | "medium" | "high" }
  Use when: Action items, tasks, to-dos are discussed
  
- agenda: Meeting agenda with checkable items
  Props: { title: string, items: [{ id: string, title: string, duration?: number }] }
  Use when: Meeting structure, agenda, topics to cover
  
- teleprompter: Scrolling script for hosts
  Props: { text: string, speed?: number, fontSize?: number }
  Use when: Script, prepared remarks, talking points needed

**ENGAGEMENT TOOLS:**
- poll: Voting interface
  Props: { question: string, options: string[] }
  Use when: Decisions, opinions, voting, choosing between options
  
- reactions: Floating reaction buttons
  Props: { reactions?: [{ icon: string, label: string }] }
  Use when: Audience engagement, live reactions, feedback
  
- scoreboard: Leaderboard/scores
  Props: { title?: string, entries: [{ name: string, score: number }] }
  Use when: Games, competitions, rankings, scores discussed
  
- qrCode: Shareable link QR code
  Props: { url: string, title?: string }
  Use when: Sharing links, URLs, websites mentioned

**VISUAL TOOLS:**
- map: Interactive map with markers
  Props: { markers: [{ lat: number, lng: number, label: string }] }
  Use when: Locations, places, geography, offices, cities mentioned
  
- chart: Mermaid diagram
  Props: { chartDef: string } (valid Mermaid syntax)
  Use when: Workflows, processes, decisions, relationships, flowcharts
  
- wordCloud: Topic visualization
  Props: { words: [{ text: string, weight: number }], title?: string }
  Use when: Key topics, themes, summarizing discussion
  
- liveChart: Data visualization
  Props: { type: "bar" | "line" | "pie", data: [{ name: string, value: number }], title?: string }
  Use when: Statistics, metrics, data, percentages discussed
  
- spotlight: Highlighted quote
  Props: { quote: string, speaker?: string, highlight?: string }
  Use when: Important quote, key statement, memorable moment

**MEDIA TOOLS:**
- mediaEmbed: YouTube/image preview
  Props: { url: string, type: "youtube" | "image" | "link", title?: string }
  Use when: Videos, images, links shared
  
- quoteCard: Display quote with attribution
  Props: { quote: string, speaker?: string, timestamp?: string }
  Use when: Notable quotes, statements to remember

**3D TOOLS (Premium visuals):**
- globe3D: Interactive 3D Earth with markers
  Props: { markers: [{ lat: number, lng: number, label: string }], autoRotate?: boolean }
  Use when: Multiple global locations, international context, impressive visual needed
  
- dataCube: 3D rotating data cube
  Props: { data?: [{ label: string, value: number, color?: string }] }
  Use when: Multiple metrics to visualize impressively
  
- particleField: Ambient particle background
  Props: { color?: string, count?: number }
  Use when: Aesthetic background, transitions, visual flair needed

**GESTURE EVENTS:**
If a gesture event is provided, respond appropriately:
- "thumbs-up": Generate a quick poll asking "Do you agree?"
- "open-palm": Clear/dismiss (respond with empty tools array)
- "victory": Generate a spotlight of the last notable quote
- "pointing": Highlight or pin important content

**LOCATION INTELLIGENCE:**
When locations are mentioned, use accurate coordinates:
- San Francisco: 37.7749, -122.4194
- New York: 40.7128, -74.0060
- London: 51.5074, -0.1278
- Tokyo: 35.6762, 139.6503
- Paris: 48.8566, 2.3522
- Sydney: -33.8688, 151.2093
- Los Angeles: 34.0522, -118.2437
- Chicago: 41.8781, -87.6298
- Singapore: 1.3521, 103.8198
- Dubai: 25.2048, 55.2708
For other locations, estimate reasonable coordinates.

**RESPONSE FORMAT:**
Return valid JSON with:
{
  "message": "Brief response (1-2 sentences)",
  "tools": [{ "type": "toolType", "props": {...} }]
}

**IMPORTANT TOOL SELECTION RULES:**
1. Keep responses concise. Generate 1-2 tools maximum per message.
2. Choose the most PRACTICAL and RELEVANT tools for the context.
3. **DO NOT use globe3D or map unless the user EXPLICITLY mentions geographic locations, cities, countries, or asks for a map.**
4. **DO NOT use dataCube or particleField unless the user asks for 3D visualization or impressive visuals.**
5. Prefer simple, practical tools: poll, timer, actionItem, chart, liveChart for most requests.
6. Use poll with detailed options (4-6 choices) for voting scenarios.
7. Use liveChart (bar, pie, line) for any data or statistics mentioned.
8. Use chart (Mermaid) for processes, workflows, and decision trees.
9. Only use 3D tools when the user explicitly requests "3D", "globe", "impressive", or mentions multiple international locations.`;

    // Handle gesture events with quick responses
    if (gestureEvent) {
      let gestureResponse = { message: "", tools: [] as ToolDefinition[] };

      switch (gestureEvent.type) {
        case "thumbs-up":
          gestureResponse = {
            message: "Quick poll triggered by thumbs up gesture.",
            tools: [{
              type: "poll",
              props: {
                question: "Do you agree with this point?",
                options: ["Yes, absolutely", "Somewhat agree", "Not sure", "Disagree"]
              }
            }]
          };
          break;
        case "open-palm":
          gestureResponse = {
            message: "Canvas cleared.",
            tools: []
          };
          break;
        case "victory":
          gestureResponse = {
            message: "Spotlight activated.",
            tools: [{
              type: "spotlight",
              props: {
                quote: gestureEvent.lastQuote || "Key moment captured",
                speaker: gestureEvent.speaker || undefined
              }
            }]
          };
          break;
        default:
          break;
      }

      if (gestureResponse.message) {
        const tools = gestureResponse.tools.map((tool, index) => ({
          ...tool,
          id: `${tool.type}-${Date.now()}-${index}`,
        }));

        return new Response(
          JSON.stringify({ message: gestureResponse.message, tools }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TAMBO_AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Defaulting to gpt-4o for best results, can be configured for Gemini as well
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = { message: content, tools: [] };
    }

    // Validate and add IDs to tools
    const tools: (ToolDefinition & { id: string })[] = (parsed.tools || []).map(
      (tool: ToolDefinition, index: number) => ({
        ...tool,
        id: `${tool.type}-${Date.now()}-${index}`,
      })
    );

    return new Response(
      JSON.stringify({
        message: parsed.message || "I understood your message.",
        tools,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-tools error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
