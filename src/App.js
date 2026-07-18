import { Provider, useSelector, useDispatch } from "react-redux";
import Body from "./component/Body";
import Header from "./component/Header";
import SiderBar from "./component/SiderBar";
import store from "./utils/store";
import { toggleEvent } from "./utils/appSlice";
import NotFound from "./component/NotFound";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Watch from "./component/Watch";
import SearchResults from "./component/SearchResults";

function AppLayout() {
  const isMenuOpen = useSelector((store) => store.app.isMenuOpen);
  const dispatch = useDispatch();
  return (
    <>
      <Header />
      {/* Mobile drawer backdrop: dims content and closes the sidebar on tap (desktop pushes instead) */}
      {isMenuOpen && (
        <div
          onClick={() => dispatch(toggleEvent())}
          className="fixed inset-0 top-14 z-40 bg-black/40 lg:hidden"
        />
      )}
      <div className="flex pt-14 h-screen">
        <SiderBar />
        <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${isMenuOpen ? "ml-0 lg:ml-56" : "ml-0"}`}>
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

// errorElement catches both 404s and runtime render errors thrown inside AppLayout children
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Body />,
      },
      {
        // videoId is passed as ?v=<id> query param, not a path segment, to mirror the real YouTube URL scheme
        path: "/watch",
        element: <Watch />,
      },
      {
        path: "/results",
        element: <SearchResults />,
      },
    ],
  },
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={appRouter} />
    </Provider>
  );
}

export default App;
