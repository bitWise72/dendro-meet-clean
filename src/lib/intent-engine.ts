export interface Intent {
    type: "timer" | "poll" | "chart" | "map" | "globe" | "scoreboard" | "none";
    confidence: number;
    params: Record<string, any>;
}

const KEYWORDS = {
    timer: ["timer", "countdown", "tamer", "time", "clock", "stopwatch"],
    poll: ["poll", "vote", "survey", "pole", "voting"],
    chart: ["chart", "diagram", "graph", "mermaid", "visualize"],
    map: ["map", "location", "geography", "place"],
    globe: ["globe", "earth", "3d globe", "planet", "world"],
    scoreboard: ["scoreboard", "score", "points", "leaderboard"],
};

export function parseIntent(text: string): Intent {
    const lowerText = text.toLowerCase();


    for (const [type, words] of Object.entries(KEYWORDS)) {
        if (words.some(word => lowerText.includes(word))) {
            const intent: Intent = {
                type: type as Intent["type"],
                confidence: 0.8,
                params: {}
            };


            if (type === "timer") {
                const minMatch = lowerText.match(/(\d+)\s*(min|minute|minut)/);
                const secMatch = lowerText.match(/(\d+)\s*(sec|second)/);
                if (minMatch) intent.params.initialSeconds = parseInt(minMatch[1]) * 60;
                else if (secMatch) intent.params.initialSeconds = parseInt(secMatch[1]);
                else intent.params.initialSeconds = 300;
            }


            if (["poll", "chart", "map", "globe"].includes(type)) {
                const aboutMatch = lowerText.match(/about\s+(.+)/) || lowerText.match(/for\s+(.+)/);
                if (aboutMatch) intent.params.topic = aboutMatch[1].trim();
            }

            return intent;
        }
    }

    return { type: "none", confidence: 0, params: {} };
}
