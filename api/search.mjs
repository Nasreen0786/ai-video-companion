// POST /api/search  { q }  ->  { items }
// Returns items in the SAME shape as the trending feed (id string + snippet + statistics),
// so the existing <VideoCards> renders them unchanged. Runs server-side with the YouTube key.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { q } = req.body || {};
  if (!q) return res.status(400).json({ error: "q required" });

  const key = process.env.REACT_APP_YT_API_KEY;
  if (!key) return res.status(500).json({ error: "YouTube API key not set" });

  try {
    // 1) search -> video IDs
    const searchUrl =
      "https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=24&q=" +
      encodeURIComponent(q) + "&key=" + key;
    const sRes = await fetch(searchUrl);
    const sData = await sRes.json();
    if (sData.error) return res.status(500).json({ error: sData.error.message || "search failed" });

    const ids = (sData.items || []).map((it) => it.id?.videoId).filter(Boolean);
    if (ids.length === 0) return res.status(200).json({ items: [] });

    // 2) videos -> full details (matches the trending feed shape)
    const videosUrl =
      "https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=" +
      ids.join(",") + "&key=" + key;
    const vRes = await fetch(videosUrl);
    const vData = await vRes.json();
    return res.status(200).json({ items: vData.items || [] });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
