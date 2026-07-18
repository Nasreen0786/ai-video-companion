# 🎬 AI Video Companion

> An AI layer on top of YouTube — instantly **summarize**, generate **study notes**, and **chat with any video**, all grounded in the video's real transcript.

**🔗 Live demo:** https://namaste-youtube-xi.vercel.app
**Built for:** OpenAI × NamasteDev **Codex** Hackathon · **Team Techbytechronicles**

---

## The problem
Videos are long. Finding the one thing you need — the gist, the steps, or the answer to a single question — means scrubbing through minutes of content. **AI Video Companion** turns any YouTube video into something you can *read, search, and ask.*

## ✨ Features
- ⚡ **Summarize** — TL;DR + auto-generated **chapters with timestamps** + key points.
- 💬 **Ask the video** — chat-style Q&A answered **only from the transcript** (no hallucination), with follow-up suggestion chips.
- 📝 **Study Notes** — structured Markdown notes you can **copy or download as `.md`**.
- 📄 **Transcript** — the full, timestamped transcript on screen.
- 🔴 Live chat + a familiar **YouTube-style UI**.

## 🧠 How it works
```
Browser  →  Vercel serverless function  →  fetch transcript (Supadata)  →  OpenAI (gpt-4o-mini)  →  grounded result
```
- **Transcript-grounded:** the model is given *only* the transcript and told never to invent facts — so answers are trustworthy (it honestly says when the info isn't in the video).
- **Keys stay server-side:** all AI calls run inside serverless functions — no API keys in the browser.
- **Mock-first:** the app runs with no OpenAI key (returns placeholders) and **auto-switches to real AI** the moment the key is set — zero code change.

## 🛠️ Engineering highlights (problems we solved)
- **YouTube blocks transcript scraping from cloud IPs.** `youtube-transcript` worked locally but failed on *every* video once deployed to Vercel (datacenter IPs are blocked). We switched to the **Supadata API** (residential proxies) via a shared `lib/transcript.mjs` helper — now it works in production — and added an in-memory cache to conserve API calls.
- **CRA + CI:** Create React App fails the production build on ESLint warnings when `CI=true` (Vercel's default). Fixed with a `CI=false` build env var.

## 🧰 Tech stack
- **Frontend:** React 19, React Router, Redux Toolkit, Tailwind CSS (Create React App)
- **Backend:** Vercel serverless functions (Node, ESM)
- **AI:** OpenAI `gpt-4o-mini`
- **Transcripts:** Supadata API
- **Video data:** YouTube Data API v3
- **Hosting:** Vercel
- **Built with:** OpenAI Codex

## 🚀 Run locally
```bash
git clone https://github.com/ankitsaini001/namaste-youtube.git
cd namaste-youtube
npm install
npm i -g vercel        # needed to run the /api functions locally
```
Create a `.env` in the project root:
```env
REACT_APP_YT_API_KEY=your_youtube_data_api_v3_key
OPENAI_API_KEY=your_openai_api_key
SUPADATA_API_KEY=your_supadata_api_key
```
Run it (⚠️ use `vercel dev`, **not** `npm start` — `npm start` doesn't serve `/api`):
```bash
vercel dev
```
Open http://localhost:3000

## ☁️ Deploy (Vercel)
1. Add the three env vars above in **Project → Settings → Environment Variables**.
2. Also add **`CI=false`** (so the CRA build doesn't fail on lint warnings).
3. Deploy: `npx vercel --prod`

## 📁 Structure
```
api/          Vercel serverless functions (summarize, ask, notes, transcript)
lib/          Shared transcript helper (Supadata + cache)
src/          React app (components, Redux, Watch page)
```

## 👥 Team — Techbytechronicles
- **Ankit Saini** — https://github.com/ankitsaini001
- **Nasreen Shah**

Built for the OpenAI × NamasteDev Codex Hackathon, July 2026.
