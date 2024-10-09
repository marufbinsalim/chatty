import PageScaffold from "@/components/PageScaffolding";
import useRealtimeThreads, { Thread } from "@/hooks/useRealtimeThreads";
import { formatMessageDate } from "@/utils/format/date";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Messages() {
  const { user } = useUser();
  const { threads, searchTerm, setSearchTerm } = useRealtimeThreads(user?.id);

  function getUserInfo(thread: Thread) {
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
      <div className="flex flex-col space-y-4 p-4 bg-gray-100 rounded-lg shadow-md flex-1">
        <h1>Messages</h1>

        <input
          type="text"
          placeholder="Search"
          className="w-full p-2 border border-gray-200 rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {threads.map((thread) => {
          const { id, name, image } = getUserInfo(thread);
          return (
            <Link href={`/messages/${thread.id}`} key={thread.id}>
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
                  <p>{formatMessageDate(thread.last_message_created_at)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageScaffold>
  );
}
