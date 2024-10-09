import { supabase } from "@/utils/supabase/uiClient";
import { useEffect, useState } from "react";

export default function useMessenger(threadId: any, userId: any) {
  const [participants, setParticipants] = useState<any[] | null>([]);
  const [participant, setParticipant] = useState<{
    user_id: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    email: string | null;
    bio: string | null;
  } | null>(null); // [participant, setParticipant
  const [messages, setMessages] = useState<any[]>([]);
  const [isPartOfThread, setIsPartOfThread] = useState<boolean>(false);

  useEffect(() => {
    async function fetchThreadParticipents() {
      const { data, error } = await supabase
        .from("thread_participants")
        .select("*")
        .eq("thread_id", threadId);

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        let isPartOfThread = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i].user_id === userId) {
            isPartOfThread = true;
            break;
          }
        }

        if (!isPartOfThread) {
          console.error("User is not part of this thread");
          return;
        }

        setIsPartOfThread(true);
        data.length === 2
          ? setParticipant(data.find((p: any) => p.user_id !== userId))
          : setParticipants(data.filter((p: any) => p.user_id !== userId));
      }
    }

    if (threadId) {
      fetchThreadParticipents();
    }
  }, [threadId]);

  return {
    // participants, -- for group chat only (not implemented yet)
    participant,
    canViewMessages: isPartOfThread,
  };
}
