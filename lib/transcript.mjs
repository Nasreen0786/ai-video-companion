// Fetches a YouTube transcript via Supadata (https://supadata.ai).
// Why: YouTube blocks caption scraping from cloud/datacenter IPs (Vercel/AWS),
// so youtube-transcript works on localhost but fails once deployed. Supadata
// uses residential proxies, so it works from Vercel's servers.
//
// Returns youtube-transcript-shaped segments: [{ text, offset, duration }] (ms).
// A small in-memory cache avoids re-fetching the same video (saves API credits).

const cache = new Map(); // videoId -> { segments, t }
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function fetchTranscript(videoId) {
  const cached = cache.get(videoId);
  if (cached && Date.now() - cached.t < TTL_MS) return cached.segments;

  const key = process.env.SUPADATA_API_KEY;
  if (!key) throw new Error("SUPADATA_API_KEY is not set");

  const endpoint =
    "https://api.supadata.ai/v1/transcript?url=" +
    encodeURIComponent("https://www.youtube.com/watch?v=" + videoId);

  const res = await fetch(endpoint, { headers: { "x-api-key": key } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Transcript API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.content ?? data.transcript ?? data.segments;

  let segments;
  if (Array.isArray(content)) {
    segments = content.map((s) => ({
      text: s.text ?? s.content ?? "",
      offset: Number(s.offset ?? s.start ?? 0),
      duration: Number(s.duration ?? s.dur ?? 0),
    }));
  } else if (typeof content === "string") {
    segments = [{ text: content, offset: 0, duration: 0 }];
  } else {
    throw new Error("Unexpected transcript API response shape");
  }

  cache.set(videoId, { segments, t: Date.now() });
  return segments;
}
