import useDiscover from "@/hooks/useDiscover";
import { supabase } from "@/pages/utils/supabase/uiClient";
import {
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Discover() {
  const [query, setQuery] = useState<string>("");

  const { users, loading, totalPage, currentPage, nextPage, previousPage } =
    useDiscover({
      query: query,
    });

  return (
    <div className="flex-1 bg-red-50">
      <h1>Discover</h1>
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users"
        />
      </div>

      {totalPage !== 0 && (
        <div className="flex gap-4 ml-auto mr-4 w-max">
          <button
            disabled={currentPage === 1}
            onClick={previousPage}
            className="disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <p>{`${currentPage}/${totalPage}`}</p>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPage}
            className="disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      )}
      {loading && <div>Loading...</div>}
      <p className="text-sm text-gray-500 break-words">
        {JSON.stringify(users)}
      </p>
    </div>
  );
}
