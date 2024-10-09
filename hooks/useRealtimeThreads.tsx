import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/uiClient";

export type Thread = {
  id: string;
  type: string;
  created_at: string;
  last_message_content: string;
  last_message_created_at: string;
  sender_id: string;
  sender_imageurl: string;
  sender_firstname: string;
  sender_lastname: string;
  sender_email: string;
  recipient_id: string;
  recipient_imageurl: string;
  recipient_firstname: string;
  recipient_lastname: string;
  recipient_email: string;
};
export default function useRealtimeThreads(userId: any) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsChanged, setThreadsChanged] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const listener = supabase
      .channel("threads_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "*" },
        (payload) => {
          setThreadsChanged((tc) => !tc);
        },
      )
      .subscribe();

    return () => {
      listener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchThreads(id: string) {
      let query = supabase
        .from("user_threads_view")
        .select("*")
        .or(`sender_id.eq.${id},recipient_id.eq.${id}`)
        .order("last_message_created_at", { ascending: false })
        .neq("last_message_content", "**start_of_conversation**");

      if (searchTerm && searchTerm.trim() !== "") {
        query = query.or(
          `sender_firstname.ilike.%${searchTerm}%,sender_lastname.ilike.%${searchTerm}%,recipient_firstname.ilike.%${searchTerm}%,recipient_lastname.ilike.%${searchTerm}%`,
        );
      }

      let { data, error } = await query;

      if (data) {
        // ineffecient but works for now - fix later
        if (searchTerm && searchTerm.trim() !== "") {
          data = data.filter((thread: Thread) => {
            // am I the sender or the recipient?
            const isSender = thread.sender_id === id;
            return isSender
              ? thread.recipient_firstname
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                  thread.recipient_lastname
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              : thread.sender_firstname
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                  thread.sender_lastname
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
          });
        }

        setThreads(data);
      } else {
        console.error(error);
      }
    }

    // add return right here!
    if (userId) fetchThreads(userId);
  }, [userId, threadsChanged, searchTerm]);

  return {
    threads: threads,
    searchTerm: searchTerm,
    setSearchTerm: setSearchTerm,
  };
}
