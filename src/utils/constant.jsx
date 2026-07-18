export const SIDE_MENU_BAR = "https://www.svgrepo.com/show/506800/burger-menu.svg";

export const YOUTUBE_LOGO = "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg";

export const USER_ICON = "https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg";

// API key is kept in .env (REACT_APP_YT_API_KEY) and injected at build time — never hard-code it here
const YOUTUBE_API_KEY = process.env.REACT_APP_YT_API_KEY;
// Fetches the 41 most popular videos in India; regionCode=IN keeps results locally relevant
export const YOUTUBE_URL = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&regionCode=IN&maxResults=41&key=${YOUTUBE_API_KEY}`;

// Suggestions are proxied through our own /api/suggest to bypass Google Suggest's CORS + http (mixed-content) blocks on the deployed site.
export const SEARCH_SUGGESTIONS = "/api/suggest?q=";

export const LIVE_CHAT_MESSAGES_SPLICE = 20;

export const CATEGORY_MAP = {
    "All":               null,
    "Music":             "10",
    "Gaming":            "20",
    "News":              "25",
    "Sports":            "17",
    "Learning":          "27",
    "Comedy":            "23",
    "Entertainment":     "24",
    "Travel & Events":   "19",
    "Autos & Vehicles":  "2",
};