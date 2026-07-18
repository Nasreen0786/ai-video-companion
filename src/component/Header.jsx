import { useDispatch, useSelector } from "react-redux";
import { SEARCH_SUGGESTIONS, SIDE_MENU_BAR, USER_ICON, YOUTUBE_LOGO } from "../utils/constant";
import { toggleEvent } from "../utils/appSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { searchSliceEvent } from "../utils/searchSlice";

const Header = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [getSearchSuggestions, setGetSearchSuggestions] = useState([]);
    // ref used to detect clicks outside the search box and close the dropdown
    const searchRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const HandleSideBarMenu = () => {
        dispatch(toggleEvent());
    }

    // Read the entire search cache from Redux so we can check it synchronously before fetching
    const cache = useSelector((store) => store.search);

    // Debounce the suggestion API call by 200 ms; skip the network if the query is cached.
    useEffect(() => {
        if (searchQuery.trim()) {
            const debounceTimer = setTimeout(() => {
                if (cache[searchQuery]) {
                    setGetSearchSuggestions(cache[searchQuery]);
                } else {
                    fetchSearchSuggestions();
                }
            }, 200);
            return () => clearTimeout(debounceTimer);
        } else {
            setGetSearchSuggestions([]);
        }
    }, [searchQuery]);

    // Close the suggestions dropdown when clicking outside the search container
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSearchSuggestions = async () => {
        try {
            const response = await fetch(SEARCH_SUGGESTIONS + encodeURIComponent(searchQuery));
            const data = await response.json();
            setGetSearchSuggestions(data);
            // Persist results in Redux so the same query never triggers a second network request
            dispatch(searchSliceEvent({ [searchQuery]: data }));
        } catch (error) {
            console.error("Error fetching search suggestions:", error);
        }
    }

    // Navigate to the results page for a query (from Enter, the search button, or a suggestion)
    const runSearch = (q) => {
        const query = (q ?? searchQuery).trim();
        if (!query) return;
        setSearchQuery(query);
        setShowSuggestions(false);
        navigate(`/results?search_query=${encodeURIComponent(query)}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        runSearch();
    };

    const handleSuggestionClick = (suggestion) => {
        runSearch(suggestion);
    };

    return (
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 shadow-md sticky top-0 bg-white z-50">
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer" onClick={() => HandleSideBarMenu()}>
                    <img className="w-6" src={SIDE_MENU_BAR} alt="side-menu" />
                </button>
                <Link to="/" className="flex items-center gap-1">
                    <img className="w-8" src={YOUTUBE_LOGO} alt="youtube" />
                    <span className="hidden sm:inline text-xl font-semibold tracking-tight">YouTube</span>
                </Link>
            </div>
            <form className="relative flex items-center flex-1 max-w-2xl mx-2" ref={searchRef} onSubmit={handleSubmit}>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-full outline-none focus:border-blue-500"
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                />
                <button type="submit" className="px-5 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200 cursor-pointer">
                    🔍
                </button>
                {/* Google Suggest returns [query, [suggestions]]; index [1] holds the actual list */}
                {showSuggestions && getSearchSuggestions.length > 0 && getSearchSuggestions[1]?.length > 0 && (
                    <div className="absolute top-full left-0 right-12 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 overflow-hidden">
                        {getSearchSuggestions[1].map((suggestion, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 px-4 py-1.5 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-sm text-gray-800 truncate">{suggestion}</span>
                            </div>
                        ))}
                    </div>
                )}
            </form>
            <div className="shrink-0">
                <img className="w-8 h-8 rounded-full cursor-pointer" src={USER_ICON} alt="user-icon" />
            </div>
        </div>
    );
}

export default Header;
