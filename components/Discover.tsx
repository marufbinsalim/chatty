import useDiscover from "@/hooks/useDiscover";
import { supabase } from "@/utils/supabase/uiClient";
import {
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronsRight,
  CircleDashed,
  Inbox,
  InboxIcon,
  LucideInbox,
  MessageCircle,
  MessageCirclePlus,
  MessageSquare,
  MessageSquareText,
  TextIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Discover() {
  const [query, setQuery] = useState<string>("");

  const { users, loading, totalPage, currentPage, nextPage, previousPage } =
    useDiscover({
      query: query,
    });

  return (
    <div className="flex-1 px-4 w-full md:w-[80vw] mx-auto flex flex-col overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Discover</h1>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users"
          className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {totalPage !== 0 && (
        <div className="flex items-center gap-4 ml-auto w-max">
          <button
            disabled={currentPage === 1}
            onClick={previousPage}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-sm font-medium">{`${currentPage}/${totalPage}`}</p>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPage}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      {loading && (
        <div className="text-center text-gray-500 w-max m-auto animate-spin">
          {" "}
          <CircleDashed />{" "}
        </div>
      )}
      <div className="flex-1 flex flex-col mt-3 overflow-y-scroll md:px-4 styled-scrollbar">
        {
          // fill with 20 users using the users array
          [...users, ...users].map((user, index) => (
            <div
              key={index}
              className="flex md:flex-row flex-col md:items-center gap-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.imageUrl}
                  alt={user.firstName}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-gray-200"
                />
                <MessageSquareText
                  strokeWidth={1}
                  size={32}
                  className="md:hidden block"
                />
              </div>
              <div className="flex flex-col text-left w-full">
                <h2 className="text-lg font-semibold break-words">{`${user.firstName} ${user.lastName}`}</h2>
                <p className="text-gray-600 break-all">{user.email}</p>
              </div>
              <MessageSquareText
                strokeWidth={1}
                size={32}
                className="hidden md:block"
              />
            </div>
          ))
        }
      </div>
    </div>
  );
}

// 1 /
//   (2)[
//     {
//       id: "user_2m1ihNpaXUNxpLkDMGrnIrK1apF",
//       email: "mdmarufbinsalim@gmail.com",
//       firstName: "Md Maruf Bin Salim",
//       lastName: "Bhuiyan",
//       bio: null,
//       imageUrl:
//         "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ybTFpaFEzaXNkeU92MFpISXVhaUE3ZDVhNzYifQ",
//     }
//   ];
