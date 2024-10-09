import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SharedManager() {
  const router = useRouter();
  const { username: sharedUsername } = router.query as { username: string };
  const { user } = useUser();

  useEffect(() => {
    async function fetchUser(sharedUsername: string, loggedInUser: any) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", sharedUsername)
        .single();

      console.log(data, error);
      if (error || !data) return;
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

      router.push(`/messages/${threadId}`);
    }

    if (sharedUsername && user) {
      fetchUser(sharedUsername, user);
    }
  }, [sharedUsername, user]);

  return (
    <div>
      <h1>Share Manager</h1>
      <p>Shared Manager ID: {sharedUsername}</p>
    </div>
  );
}
