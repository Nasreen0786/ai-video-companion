import { fetchTranscript } from "../lib/transcript.mjs";

// POST /api/ask  { videoId, question }  ->  { answer }
// Mock-first: works with NO OpenAI key. Add OPENAI_API_KEY -> real answers turn on automatically.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { videoId, question } = req.body || {};
  if (!videoId || !question) return res.status(400).json({ error: "videoId and question are required" });

  try {
    // transcript — works WITHOUT any API key
    const segments = await fetchTranscript(videoId);
    const transcript = segments
      .map((s) => {
        const totalSeconds = Math.floor(Number(s.offset || 0) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `[${minutes}:${seconds}] ${s.text}`;
      })
      .join("\n")
      .slice(0, 100000);

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
            `Answer the user's question using ONLY the video transcript below. Treat the transcript as the sole source of truth: never invent, infer, or add facts that are not explicitly supported by it. If the requested information is absent or unclear, say that the transcript does not provide it.

Match the depth and format to the user's request:
- For simple questions, answer briefly and directly.
- If the user asks for a tutorial, full breakdown, steps, or the full content, provide a thorough step-by-step walkthrough with numbered steps and relevant transcript timestamps.
- If the user asks for the transcript or full content, you may reproduce the transcript content directly instead of summarizing it.

Use only timestamps shown in the transcript; never fabricate timestamps.

TRANSCRIPT:
` +
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
