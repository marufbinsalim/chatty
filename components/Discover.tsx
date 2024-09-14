import useDiscover from "@/hooks/useDiscover";
import { supabase } from "@/utils/supabase/uiClient";
import {
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronsRight,
  CircleDashed,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Discover() {
  const [query, setQuery] = useState<string>("");

  const { users, loading, totalPage, currentPage, nextPage, previousPage } =
    useDiscover({
      query: query,
    });

  return (
    <div className="flex-1 p-4 md:w-[80vw] m-auto">
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
      <div className="flex flex-col mt-3">
        {
          // fill with 20 users using the users array
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <img
                src={user.imageUrl}
                alt={user.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold">{`${user.firstName} ${user.lastName}`}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
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
