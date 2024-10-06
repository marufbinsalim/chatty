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
    console.log("createOrGoToThread", user.id, targetUserId);

    const { data, error } = await supabase.rpc("get_direct_thread_id", {
      user_id_1: user.id,
      user_id_2: targetUserId,
    });
    if (error) {
      console.error("Error calling function:", error);
      return;
    }

    if (data) {
      console.log("data", data);
      router.push(`/messages/${data}`);
      return;
    }

    // else insert new thread and add users to participants table
    const { data: newThreadData, error: newThreadError } = await supabase
      .from("threads")
      .insert({})
      .select()
      .single();

    console.log("newThreadData", newThreadData);

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

    console.log("newParticipantsData", newParticipantsData);

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

    console.log("newMessageData", newMessageData, newMessageError);
    router.push(`/messages/${threadId}`);
  }

  return (
    <div className="flex-1 px-4 w-full md:w-[80vw] mx-auto flex flex-col overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Discover</h1>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users"
          className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {totalPage !== 0 && (
        <div className="flex items-center gap-4 ml-auto w-max">
          <button
            disabled={currentPage === 1}
            onClick={previousPage}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <p className="text-sm font-light">{`${currentPage}/${totalPage}`}</p>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPage}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      {loading && (
        <div className="text-center text-gray-500 w-max m-auto animate-spin">
          {" "}
          <CircleDashed />{" "}
        </div>
      )}
      <div className="flex-1 flex flex-col mt-3 overflow-y-auto styled-scrollbar md:px-4">
        {!loading &&
          users.map((user, index) => (
            <div
              key={index}
              className="flex md:flex-row flex-col md:items-center gap-4 mb-4 p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.imageUrl}
                  alt={user.firstName}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                />
                <MessageSquareText
                  onClick={() => createOrGoToThread(user.id)}
                  strokeWidth={1}
                  size={32}
                  className="md:hidden block cursor-pointer"
                />
              </div>
              <div className="flex flex-col text-left w-full">
                <h2 className="text-lg font-semibold break-words">{`${user.firstName} ${user.lastName}`}</h2>
                <p className="text-gray-600 break-all font-light">
                  {user.email}
                </p>
              </div>
              <MessageSquareText
                onClick={() => createOrGoToThread(user.id)}
                strokeWidth={1}
                size={32}
                className="hidden md:block cursor-pointer"
              />
            </div>
          ))}
        {!loading && (!users || users.length === 0) ? (
          <div className="flex flex-col items-center justify-center gap-4 shadow-sm p-4 border border-gray-200 rounded-lg mt-2">
            <p className="text-2xl">No users found</p>
            <p className="text-gray-500 text-center">
              No users found. Try searching for another user.
            </p>
            <XCircleIcon
              strokeWidth={0.8}
              size={64}
              className="cursor-pointer"
              onClick={() => setQuery("")}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
