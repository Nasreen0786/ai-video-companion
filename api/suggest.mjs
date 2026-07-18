// GET /api/suggest?q=...  ->  Google Suggest array  [query, [suggestions]]
// Proxies Google Suggest server-side to bypass browser CORS + mixed-content (http) blocks.
export default async function handler(req, res) {
  const q = (req.query?.q ?? "").toString();
  if (!q) return res.status(200).json([q, []]);
  try {
    const r = await fetch(
      "https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=" + encodeURIComponent(q)
    );
    const txt = await r.text();
    return res.status(200).json(JSON.parse(txt));
  } catch {
    return res.status(200).json([q, []]);
  }
}
