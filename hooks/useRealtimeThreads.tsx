import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/uiClient";

export default function useRealtimeThreads(userId: any) {
  const [threads, setThreads] = useState<any[]>([]);
  const [threadsChanged, setThreadsChanged] = useState(false);

  useEffect(() => {
    const listener = supabase
      .channel("threads_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "*" },
        (payload) => {
          console.log("Threads changed!", payload);
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
      const { data, error } = await supabase
        .from("user_threads_view")
        .select("*")
        .or(`sender_id.eq.${id},recipient_id.eq.${id}`)
        .order("last_message_created_at", { ascending: false });
      if (data) {
        setThreads(
          data.filter(
            (thread: any) =>
              // if the last message is not the start of the conversation
              // then show the thread
              // thread.last_message_content !== "**start_of_conversation**",
              true,
          ),
        );
        console.log(data);
      } else {
        console.error(error);
      }
    }

    // add return right here!
    if (userId) fetchThreads(userId);
  }, [userId, threadsChanged]);

  return {
    threads: threads,
  };
}
