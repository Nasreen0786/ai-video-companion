import { useSearchParams } from "react-router-dom";
import Comment from "./Comment";
import LiveChat from "./LiveChat";
import SummaryPanel from "./SummaryPanel";
import NotesPanel from "./NotesPanel";
import AskPanel from "./AskPanel";

const Watch = () => {

    const [queryParams] = useSearchParams();
    const videoId = queryParams.get("v");
    return (
        <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Left: video + AI summary + comments */}
                <div className="flex-1 min-w-0">
                    <iframe className="w-full aspect-video rounded-lg" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    <SummaryPanel videoId={videoId} />
                    <NotesPanel videoId={videoId} />
                    <h1 className="text-2xl font-bold mt-4">Comments</h1>
                    <Comment />
                </div>

                {/* Right sidebar: live chat + ask (YouTube-style) */}
                <div className="w-full lg:w-[34rem] shrink-0 flex flex-col gap-4">
                    <div className="h-[515px] border border-black rounded-lg overflow-hidden">
                        <LiveChat />
                    </div>
                    <AskPanel videoId={videoId} />
                </div>
            </div>
        </div>
    );
}

export default Watch;
