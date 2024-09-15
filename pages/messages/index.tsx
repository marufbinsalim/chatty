import PageScaffold from "@/components/PageScaffolding";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Messages() {
  const { user } = useUser();
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    async function fetchThreads(id: string) {
      const { data, error } = await supabase
        .from("user_threads_view")
        .select("*")
        .or(`sender_id.eq.${id},recipient_id.eq.${id}`);
      if (data) {
        setThreads(data);
        console.log(data);
      } else {
        console.error(error);
      }
    }

    if (user) fetchThreads(user.id);
  }, [user]);

  function getUserInfo(thread: any) {
    if (user?.id === thread.sender_id) {
      return {
        id: thread.recipient_id,
        name: `${thread.recipient_firstname} ${thread.recipient_lastname}`,
        image: thread.recipient_imageurl,
      };
    } else {
      return {
        id: thread.sender_id,
        name: `${thread.sender_firstname} ${thread.sender_lastname}`,
        image: thread.sender_imageurl,
      };
    }
  }

  return (
    <PageScaffold route="/messages">
      <h1>Messages</h1>
      <div className="flex flex-col space-y-4 p-4 bg-gray-100 rounded-lg shadow-md">
        {threads.map((thread) => {
          const { id, name, image } = getUserInfo(thread);
          return (
            <Link href={`/messages/${id}`} key={thread.id}>
              <div
                key={thread.id}
                className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md border border-gray-200"
              >
                <img
                  src={image}
                  alt={name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h2 className="text-lg font-semibold">{name}</h2>
                  <p className="text-gray-500">{thread.last_message_content}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageScaffold>
  );
}

// created_at: "2024-09-15T13:32:50.056638+00:00";
// id: "a224e7f1-d872-4249-b5c4-cbda5fe4ec6b";
// last_message_content: "**start_of_conversation**";
// last_message_created_at: "2024-09-15T13:32:50.448051+00:00";
// recipient_email: "moyiimrin696@gmail.com";
// recipient_firstname: "Mrin";
// recipient_id: "user_2m1jWzTQ7rOMh9fBDThuzZyWgF5";
// recipient_imageurl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ybTFqV3R0VUhKb3VRTlF6cko3YzBRM25KTzQifQ";
// recipient_lastname: "Moyii";
// sender_email: "mdmarufbinsalim@gmail.com";
// sender_firstname: "maruf";
// sender_id: "user_2m1ihNpaXUNxpLkDMGrnIrK1apF";
// sender_imageurl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ybTFpaFEzaXNkeU92MFpISXVhaUE3ZDVhNzYifQ";
// sender_lastname: "Bhuiyan";
// type: "direct";
