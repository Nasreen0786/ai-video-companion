import { fetchTranscript } from "../lib/transcript.mjs";

// POST /api/notes  { videoId }  ->  { notes }  (Markdown)
// Mock-first: works with NO OpenAI key. Add OPENAI_API_KEY -> real notes turn on automatically.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { videoId } = req.body || {};
  if (!videoId) return res.status(400).json({ error: "videoId required" });

  try {
    const segments = Array.isArray(req.body?.segments) && req.body.segments.length ? req.body.segments : await fetchTranscript(videoId);
    const transcript = segments.map((s) => s.text).join(" ").slice(0, 100000);

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        notes:
          "# [MOCK] Study Notes\n\nAdd your OpenAI key to generate real notes.\n\n## Overview\n- Key idea one\n- Key idea two\n\n## Details\n- **Term:** explanation\n- Another point (2:15)\n",
      });
    }

    const OpenAI = (await import("openai")).default;
    const client = new OpenAI();
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You create clear, well-structured STUDY NOTES from a YouTube video transcript. Use Markdown: a short title (#), section headings (##), bullet points, **bold** key terms, and include timestamps where the transcript provides them. Be thorough but organized. Base everything ONLY on the transcript; do not invent facts. Write in English.",
        },
        { role: "user", content: transcript },
      ],
    });
    return res.status(200).json({ notes: r.choices[0].message.content });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
