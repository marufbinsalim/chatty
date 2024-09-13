import { supabase } from "@/pages/utils/supabase/uiClient";
import { useEffect, useState } from "react";

export default function Discover() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .range(0, 10);
        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="flex-1 bg-red-50">
      <h1>Discover</h1>
      {JSON.stringify(users)}
    </div>
  );
}
