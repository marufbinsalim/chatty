import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;
export default function useDiscover({ query }: { query: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const { user } = useUser();

  useEffect(() => {
    console.log("query", query);

    async function fetchUsers() {
      console.log("fetching users");
      try {
        setLoading(true);
        const { data, error, count } = await supabase
          .from("users")
          .select("*", { count: "exact" })
          .ilike("user_name", `%${query}%`)
          .neq("id", user?.id)
          .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

        if (error) throw error;

        setUsers(data);
        if (typeof count !== "number") throw new Error("Count is not a number");
        setTotalPage(Math.ceil(count / PAGE_SIZE));
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchUsers();
  }, [user, currentPage, debouncedQuery]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedQuery(query);
    }, 700);

    return () => clearTimeout(timeout);
  }, [query]);

  async function searchForUsers() {}

  async function nextPage() {
    setCurrentPage(currentPage + 1);
  }
  async function previousPage() {
    setCurrentPage(currentPage - 1);
  }

  return {
    users,
    loading,
    searchForUsers,
    nextPage,
    previousPage,
    currentPage,
    totalPage,
  };
}
