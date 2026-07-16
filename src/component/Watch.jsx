import { useSearchParams } from "react-router-dom";
import Comment from "./Comment";
import LiveChat from "./LiveChat";
import SummaryPanel from "./SummaryPanel";
import AskPanel from "./AskPanel";

const Watch = () => {

    const [queryParams] = useSearchParams();
    const videoId = queryParams.get("v");
    return (
        <div className="p-4">
            {/* Row 1: video + live chat side-by-side */}
            <div className="flex flex-col lg:flex-row gap-4">
                <iframe  className="w-full lg:flex-1 min-w-0 aspect-video rounded-lg" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                <div className="w-full lg:w-[34rem] shrink-0 h-[515px] border border-black rounded-lg overflow-hidden">
                    <LiveChat />
                </div>
            </div>

            {/* AI Summary panel */}
            <div className="w-[1000px]">
                <SummaryPanel videoId={videoId} />
                <AskPanel videoId={videoId} />
            </div>

            {/* Row 2: comments under the video only */}
            <div className="w-[1000px]">
                <h1 className="text-2xl font-bold mt-4">Comments</h1>
                <Comment />
            </div>
        </div>
    );
}

export default Watch;