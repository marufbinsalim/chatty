import PageScaffold from "@/components/PageScaffolding";
import useRealtimeThreads, { Thread } from "@/hooks/useRealtimeThreads";
import { formatMessageDate } from "@/utils/format/date";
import { truncateString } from "@/utils/format/textPreview";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import { MapIcon, Search, SearchIcon } from "lucide-react";
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

        <div className="relative w-[90%] mx-auto">
          {threads.length > 0 && (
            <input
              type="text"
              placeholder="Search"
              className="p-2 border border-gray-200 rounded-full pl-10 w-full focus:outline-none focus:ring-1 focus:ring-green-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-4 flex flex-col flex-1 overflow-auto">
          {threads.map((thread) => {
            const { id, name, image } = getUserInfo(thread);
            return (
              <Link href={`/messages/${thread.id}`} key={thread.id}>
                <div
                  key={thread.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 w-[90%] m-auto bg-secondary-color rounded-3xl shadow-md "
                >
                  <img
                    src={image}
                    alt={name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">{name}</h2>
                      <p className="text-gray-500">
                        {formatMessageDate(thread.last_message_created_at)}
                      </p>
                    </div>
                    <p className="text-gray-500">
                      {truncateString(thread.last_message_content, 50)}
                    </p>
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
