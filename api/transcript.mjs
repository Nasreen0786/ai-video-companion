import { fetchTranscript } from "../lib/transcript.mjs";

// POST /api/transcript  { videoId }  ->  { lines: [{ start, end, text }] }
// No AI needed — free, instant, works without an OpenAI key.
const fmt = (ms) => {
  const s = Math.floor((ms || 0) / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { videoId } = req.body || {};
  if (!videoId) return res.status(400).json({ error: "videoId required" });
  try {
    const segments = await fetchTranscript(videoId);
    const lines = segments.map((s) => ({
      start: fmt(s.offset),
      end: fmt(s.offset + s.duration),
      text: s.text,
    }));
    return res.status(200).json({ lines, segments });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
