import PageScaffold from "@/components/PageScaffolding";
import useRealtimeThreads, { Thread } from "@/hooks/useRealtimeThreads";
import { formatMessageDate } from "@/utils/format/date";
import { truncateString } from "@/utils/format/textPreview";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import { MapIcon, SearchIcon } from "lucide-react";
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
      <div className="flex flex-col space-y-4 lg:p-4 flex-1 overflow-hidden lg:w-[60vw] w-full m-auto mt-4">
        {threads.length === 0 && (
          <div className="flex flex-col items-center space-y-4 flex-1 justify-center border border-gray-200 rounded-lg p-4 max-w-[90vw] m-auto md:m-0 mt-16">
            <h1 className="text-2xl font-semibold">No messages yet</h1>
            <Link href="/">
              <SearchIcon
                strokeWidth={0.8}
                size={64}
                className="cursor-pointer"
              />
            </Link>
            <p className="text-gray-500 text-center">
              Discover and connect with people around you
            </p>
          </div>
        )}

        {threads.length > 0 && (
          <input
            type="text"
            placeholder="Search"
            className="m-auto p-2 border border-gray-200 rounded-lg w-[90%]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}

        <div className="space-y-4 flex flex-col flex-1 overflow-auto">
          {threads.map((thread) => {
            const { id, name, image } = getUserInfo(thread);
            return (
              <Link href={`/messages/${thread.id}`} key={thread.id}>
                <div
                  key={thread.id}
                  className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md border border-gray-200 w-[90%] m-auto"
                >
                  <img
                    src={image}
                    alt={name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{name}</h2>
                    <p className="text-gray-500">
                      {truncateString(thread.last_message_content, 50)}
                    </p>
                    <p>{formatMessageDate(thread.last_message_created_at)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageScaffold>
  );
}
