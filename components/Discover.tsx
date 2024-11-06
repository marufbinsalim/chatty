import useDiscover from "@/hooks/useDiscover";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronsRight,
  CircleDashed,
  Inbox,
  InboxIcon,
  LucideInbox,
  MessageCircle,
  MessageCirclePlus,
  MessageSquare,
  MessageSquareText,
  TextIcon,
  XCircleIcon,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Discover() {
  const [query, setQuery] = useState<string>("");
  const { user } = useUser();
  const { users, loading, totalPage, currentPage, nextPage, previousPage } =
    useDiscover({
      query: query,
    });

  const router = useRouter();

  async function createOrGoToThread(targetUserId: string) {
    if (!user) return;

    const { data, error } = await supabase.rpc("get_direct_thread_id", {
      user_id_1: user.id,
      user_id_2: targetUserId,
    });
    if (error) {
      console.error("Error calling function:", error);
      return;
    }

    if (data) {
      router.push(`/messages/${data}`);
      return;
    }

    // else insert new thread and add users to participants table
    const { data: newThreadData, error: newThreadError } = await supabase
      .from("threads")
      .insert({
        created_by: user.id,
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
            user_id: user.id,
            thread_id: threadId,
          },
          {
            user_id: targetUserId,
            thread_id: threadId,
          },
        ])
        .select();

    if (newParticipantsError) {
      console.error("Error inserting new participants:", newParticipantsError);
      return;
    }

    // add a new message to the thread - "conversation started"
    const { data: newMessageData, error: newMessageError } = await supabase
      .from("messages")
      .insert([
        {
          thread_id: threadId,
          user_id: user.id,
          recipient_id: targetUserId,
          content: "**start_of_conversation**",
        },
      ])
      .select()
      .single();

    router.push(`/messages/${threadId}`);
  }
  return (
    <div className="flex flex-col w-full">
      <div className="relative px-4 w-[60vw] mx-auto">
        <div className="absolute inset-y-0 mt-4 pl-3 flex items-center">
          <Search className="h-5 w-5 text-gray-300" strokeWidth={2} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users"
          className="bg-[#4b497a] rounded-full py-2 mt-4 text-white pl-10 pr-4 w-full shadow-sm focus:outline-none focus:ring-1 focus:ring-[#b0a6c1]"

        />
      </div>

      <div className="mt-4 md:w-[60vw] w-full md:rounded-lg rounded-3xl mx-auto  flex-col ">
        {loading && (
          <div className="text-center text-white w-max m-auto animate-spin">
            <CircleDashed size={24} className="text-white" />
          </div>
        )}

        <div className="flex-1 flex flex-col rounded-lg overflow-hidden md:rounded-lg ">
          {!loading &&
            users.map((user, index) => (
              <div
                key={index}
                className="flex md:justify-between md:flex-row flex-col  bg-[#4b497a]  md:items-center text-white gap-4  p-4 border-b border-gray-500 shadow-sm hover:bg-[#5a537f] transition-all duration-300"

              >
                <div className="flex  items-center gap-4">
                  <img
                    src={user.imageUrl}
                    alt={user.firstName}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm"
                  />
                  <div className="flex flex-col text-left w-full">
                    <h2 className="text-lg font-semibold text-white">{`${user.firstName} ${user.lastName}`}</h2>
                    <p className="text-gray-400">{user.email}</p>
                  </div>

                  <MessageSquareText
                    onClick={() => createOrGoToThread(user.id)}
                    strokeWidth={1}
                    size={32}
                    className="md:hidden block cursor-pointer  text-white"
                  />
                </div>
              
                <MessageSquareText
                  onClick={() => createOrGoToThread(user.id)}
                  strokeWidth={1}
                  size={32}
                  className="hidden md:block cursor-pointer text-white"
                />
              </div>
            ))}

          {!loading && (!users || users.length === 0) && (
            <div className="flex flex-col items-center justify-center gap-4 shadow-sm p-4 border  border-gray-200 rounded-lg mt-2">
              <p className="text-2xl text-white">No users found</p>
              <p className="text-white text-center">
                Try searching for another user.
              </p>
              <XCircleIcon
                strokeWidth={0.8}
                size={64}
                className="text-white cursor-pointer"
                onClick={() => setQuery("")}
              />
            </div>
          )}
        </div>
      </div>
      {totalPage !== 0 && (
        <div className="flex  items-center gap-4 ml-auto md:pr-[20vw] mr-2 w-max mt-4">
          <button
            disabled={currentPage === 1}
            onClick={previousPage}
            className={`p-2 rounded-full ${currentPage === 1 ? 'bg-gray-300' : 'bg-[#4b497a] hover:bg-[#5a537f]'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <p className="text-sm font-light text-white">{`${currentPage}/${totalPage}`}</p>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPage}
            className={`p-2 rounded-full ${currentPage === totalPage ? 'bg-gray-300' : 'bg-[#4b497a] hover:bg-[#5a537f]'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

    </div>

  );
}
