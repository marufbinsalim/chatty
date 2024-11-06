import PageScaffold from "@/components/PageScaffolding";
import useRealtimeThreads, { Thread } from "@/hooks/useRealtimeThreads";
import { formatMessageDate } from "@/utils/format/date";
import { truncateString } from "@/utils/format/textPreview";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";
import Link from "next/link";

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
      <div className="relative mt-4 w-[60vw] px-4 mx-auto">
        {threads.length > 0 && (
          <input
            type="text"
            placeholder="Search"
            className="bg-[#4b497a] rounded-full py-2 text-white pl-10 w-full shadow-sm focus:outline-none focus:ring-1 focus:ring-[#b0a6c1]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
        <div className="absolute inset-y-0 ml-1 flex items-center">
          <Search className="ml-2 h-5 w-5 text-gray-300" strokeWidth={2} />
        </div>
      </div>
      <div className="flex flex-col  overflow-hidden lg:w-[60vw] w-full m-auto  mt-4 bg-[#4b497a] rounded-xl ">
        {threads.length === 0 && (
          <div className="flex  flex-col items-center space-y-4 flex-1 justify-center border  rounded-lg p-6 max-w-[90vw] m-auto md:m-0 mt-16  shadow-md">
            <h1 className="text-2xl font-semibold text-white">No messages yet</h1>
            <Link href="/">
              <Search size={64} className="text-gray-400 cursor-pointer" />
            </Link>
            <p className="text-gray-500 text-center">Discover and connect with people around you</p>
          </div>
        )}

        <div className="flex  flex-col overflow-auto ">
          {threads.map((thread) => {
            const { id, name, image } = getUserInfo(thread);
            return (
              <Link href={`/messages/${thread.id}`} key={thread.id}>
                <div
                  key={thread.id}
                  className="flex items-center justify-center  p-4 gap-4 w-full border-b border-gray-500  hover:bg-[#5a537f] transition-all duration-300 shadow-md "
                >
                  <img
                    src={image}
                    alt={name}
                    className="w-12 h-12 rounded-full shadow-sm"
                  />
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-white">{name}</h2>
                      <p className="text-gray-400">
                        {formatMessageDate(thread.last_message_created_at)}
                      </p>
                    </div>
                    <p className="text-gray-400">
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
