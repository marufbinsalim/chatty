import { supabase } from "@/utils/supabase/uiClient";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Thread() {
  const router = useRouter();
  const [threadId, setThreadId] = useState<string | null>(
    router.query.thread_id as string | null,
  );

  const [participants, setParticipants] = useState<any[]>([]);

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

      console.log(data);
      if (data) {
        setParticipants(data);
      }
    }

    if (threadId) {
      fetchThreadParticipents();
    }
  }, [threadId]);

  return (
    <div>
      <h1>Thread</h1>
      {threadId}
      {participants.map((participant) => (
        <div key={participant.user_id} className="flex items-center space-x-4">
          <img
            src={participant.imageUrl}
            alt={participant.firstName}
            className="w-12 h-12 rounded-full"
          />
          <p>{participant.firstName}</p>
          <p>{participant.email}</p>
        </div>
      ))}
    </div>
  );
}
