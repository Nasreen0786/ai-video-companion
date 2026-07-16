import { YoutubeTranscript } from "youtube-transcript";

// POST /api/ask  { videoId, question }  ->  { answer }
// Mock-first: works with NO OpenAI key. Add OPENAI_API_KEY -> real answers turn on automatically.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { videoId, question } = req.body || {};
  if (!videoId || !question) return res.status(400).json({ error: "videoId and question are required" });

  try {
    // transcript — works WITHOUT any API key
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = segments.map((s) => s.text).join(" ").slice(0, 40000);

    // NO key yet -> mock answer so the feature works today
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        answer: `[MOCK] Real AI answer appears once you add your OpenAI key. You asked: "${question}". (Transcript available: ${transcript.length} chars.)`,
      });
    }

    // REAL AI — grounded ONLY in the transcript (prevents hallucination)
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI();
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You answer questions about a YouTube video using ONLY the transcript below. If the answer is not in the transcript, say so honestly. Answer concisely in English.\n\nTRANSCRIPT:\n" +
            transcript,
        },
        { role: "user", content: question },
      ],
    });
    return res.status(200).json({ answer: r.choices[0].message.content });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
