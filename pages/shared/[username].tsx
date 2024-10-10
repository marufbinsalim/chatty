import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import { CircleDashed, Home, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Error = "no_user_found";

export default function SharedManager() {
  const router = useRouter();
  const { username: sharedUsername } = router.query as { username: string };
  const { user } = useUser();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser(sharedUsername: string, loggedInUser: any) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", sharedUsername)
        .single();

      console.log(data, error);
      if (error || !data) {
        console.error("Error fetching user:", error);
        setError("no_user_found");
        setLoading(false);
        return;
      }
      let sharedUserId = data.id as string;
      let loggedInUserId = loggedInUser.id as string;

      if (sharedUserId === loggedInUserId) {
        router.push("/messages");
        return;
      }

      const { data: threadIdData, error: threadIdError } = await supabase.rpc(
        "get_direct_thread_id",
        {
          user_id_1: loggedInUserId,
          user_id_2: sharedUserId,
        },
      );
      if (threadIdError) {
        console.error("Error calling function:", threadIdError);
        return;
      }

      if (threadIdData) {
        router.push(`/messages/${threadIdData}`);
        return;
      }

      // else insert new thread and add users to participants table
      const { data: newThreadData, error: newThreadError } = await supabase
        .from("threads")
        .insert({
          created_by: loggedInUserId,
        })
        .select()
        .single();

      if (newThreadError) {
        console.error("Error inserting new thread:", newThreadError);
        return;
      }

      const threadId = newThreadData?.id;

      const { data: newParticipantsData, error: newParticipantsError } =
        await supabase
          .from("participants")
          .insert([
            {
              user_id: loggedInUserId,
              thread_id: threadId,
            },
            {
              user_id: sharedUserId,
              thread_id: threadId,
            },
          ])
          .select();

      if (newParticipantsError) {
        console.error(
          "Error inserting new participants:",
          newParticipantsError,
        );
        return;
      }

      // add a new message to the thread - "conversation started"
      const { data: newMessageData, error: newMessageError } = await supabase
        .from("messages")
        .insert([
          {
            thread_id: threadId,
            user_id: loggedInUserId,
            recipient_id: sharedUserId,
            content: "**start_of_conversation**",
          },
        ])
        .select()
        .single();

      setLoading(false);
      router.push(`/messages/${threadId}`);
    }

    if (sharedUsername && user) {
      fetchUser(sharedUsername, user);
    }
  }, [sharedUsername, user]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center gap-4 shadow-sm p-4 border border-gray-200 rounded-lg mt-2">
        {error === "no_user_found" && (
          <p className="text-gray-500 text-center">
            No user found with the username <strong>{sharedUsername}</strong>
          </p>
        )}
        {error === "no_user_found" && (
          <div>
            <Link href="/">
              <Home strokeWidth={0.8} size={64} className="cursor-pointer" />
            </Link>
            <p className="text-gray-500 text-center">
              Go back to the home page
            </p>
          </div>
        )}

        {loading && (
          <CircleDashed strokeWidth={0.8} size={64} className="animate-spin" />
        )}
      </div>
    </div>
  );
}
