import { YoutubeTranscript } from "youtube-transcript";

// POST /api/summarize  { videoId }  ->  { summary, chapters, keyPoints }
// Mock-first: works with NO OpenAI key. Add OPENAI_API_KEY -> real AI turns on automatically.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { videoId } = req.body || {};
  if (!videoId) return res.status(400).json({ error: "videoId required" });

  try {
    // 1) transcript — works WITHOUT any API key
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = segments.map((s) => s.text).join(" ").slice(0, 40000);

    // 2) NO key yet -> return a MOCK so the whole app works today
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        summary: `[MOCK] Real AI summary appears once you add your OpenAI key. (Transcript fetched: ${transcript.length} chars.)`,
        chapters: [
          { time: "0:00", title: "[MOCK] Intro" },
          { time: "1:30", title: "[MOCK] Main point" },
          { time: "4:00", title: "[MOCK] Wrap-up" },
        ],
        keyPoints: ["[MOCK] Key point 1", "[MOCK] Key point 2", "[MOCK] Key point 3"],
      });
    }

    // 3) REAL AI — turns on automatically the moment the key exists
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI();
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Summarize this YouTube video transcript IN ENGLISH. Reply with ONLY valid JSON: { "summary": string, "chapters": [{"time": string, "title": string}], "keyPoints": string[] }.',
        },
        { role: "user", content: transcript },
      ],
    });
    return res.status(200).json(JSON.parse(r.choices[0].message.content));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
