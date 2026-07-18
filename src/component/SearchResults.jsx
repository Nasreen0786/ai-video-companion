import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import VideoCards from "./VideoCards";

// Search runs client-side (same as the trending feed) so it uses the same key/referrer context.
const KEY = process.env.REACT_APP_YT_API_KEY;

const SearchResults = () => {
  const [params] = useSearchParams();
  const q = params.get("search_query") || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      setVideos([]);
      try {
        // 1) search -> video IDs
        const sRes = await fetch(
          `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=24&q=${encodeURIComponent(q)}&key=${KEY}`
        );
        const sData = await sRes.json();
        if (sData.error) throw new Error(sData.error.message);
        const ids = (sData.items || []).map((it) => it.id?.videoId).filter(Boolean);
        if (ids.length === 0) {
          if (!cancelled) setVideos([]);
          return;
        }
        // 2) videos -> full details (matches the feed shape, so <VideoCards> works unchanged)
        const vRes = await fetch(
          `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids.join(",")}&key=${KEY}`
        );
        const vData = await vRes.json();
        if (!cancelled) setVideos(vData.items || []);
      } catch (e) {
        if (!cancelled) setError("Search failed. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-semibold">Results for “{q}”</h2>
      {loading && <p className="mt-6 text-gray-500">Searching…</p>}
      {error && !loading && <p className="mt-6 text-red-600">{error}</p>}
      {!loading && !error && videos.length === 0 && q && (
        <p className="mt-6 text-gray-500">No results found.</p>
      )}
      <div className="flex flex-wrap justify-center gap-4">
        {videos.map((video) => (
          <Link to={`/watch?v=${video.id}`} key={video.id}>
            <VideoCards video={video} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
