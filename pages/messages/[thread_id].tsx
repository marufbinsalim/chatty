import useMessenger from "@/hooks/useMessenger";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, CircleDashed } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const FETCH_LIMIT = 15;

type Message = {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  sent_at: string;
  recipient_id: string;
};

export default function Thread() {
  const router = useRouter();
  const [threadId, setThreadId] = useState<string | null>(
    router.query.thread_id as string | null,
  );
  const { user } = useUser();
  const { participant, canViewMessages } = useMessenger(threadId, user?.id);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const canLoadMore = useRef<boolean>(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [lastFetchedBatchesLastId, setLastFetchedBatchesLastId] = useState<
    string | null
  >(null);
  const [inputText, setInputText] = useState<string>("");
  const [sendingText, setSendingText] = useState<Boolean>(false);

  const fetchMessages = async (pageNum: number) => {
    canLoadMore.current = false;
    setLoading(true);
    const { count: totalMessages, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("thread_id", threadId);

    let totalMessagesCount = totalMessages as number;
    let start = totalMessagesCount - pageNum * FETCH_LIMIT;
    let end = start + FETCH_LIMIT - 1;

    const MAX_PAGE = Math.ceil(totalMessagesCount / FETCH_LIMIT);
    if (pageNum > MAX_PAGE) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("sent_at", { ascending: true })
      .range(start, end);

    let newMessages = data?.filter(
      (message) => message.content !== "**start_of_conversation**",
    ) as Message[];
    let lastId: string | null = newMessages[newMessages.length - 1]
      ? newMessages[newMessages.length - 1].id
      : null;
    setLastFetchedBatchesLastId(lastId);
    setMessages((prevMessages) => {
      if (!prevMessages) return newMessages;
      return [...newMessages, ...prevMessages];
    });
    setLoading(false);
  };

  useEffect(() => {
    if (!lastFetchedBatchesLastId) return;
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "instant" });
      canLoadMore.current = true;
    }
  }, [lastFetchedBatchesLastId]);

  useEffect(() => {
    const listener = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.thread_id !== threadId) return;
          setMessages((prevMessages) => {
            if (!prevMessages) return [newMessage];
            return [...prevMessages, newMessage];
          });
          setLastFetchedBatchesLastId(newMessage.id);
        },
      )
      .subscribe();

    return () => {
      listener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (canLoadMore.current) {
      fetchMessages(page);
    }
  }, [page]);

  const handleScroll = (entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  async function sendMessage() {
    if (!user) return;
    if (!participant) return;
    if (!inputText || inputText.trim() === "" || sendingText) return;
    setSendingText(true);

    const { data: newMessageData, error: newMessageError } = await supabase
      .from("messages")
      .insert([
        {
          thread_id: threadId,
          user_id: user?.id,
          recipient_id: participant.user_id,
          content: inputText,
        },
      ])
      .select()
      .single();

    setInputText("");
    setSendingText(false);
  }

  function getMessageSender(message: Message): {
    user_id: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    isSelfMessage: boolean;
  } | null {
    if (!user || !participant) return null;

    return message.user_id === user.id
      ? {
          user_id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          isSelfMessage: true,
        }
      : {
          user_id: participant?.user_id,
          firstName: participant?.firstName,
          lastName: participant?.lastName,
          imageUrl: participant?.imageUrl,
          isSelfMessage: false,
        };
  }

  function formatMessageDate(date: string): string {
    {
    }

    let dateObj = new Date(date);
    let formattedDate = dateObj.toLocaleDateString();
    let formattedTime = dateObj.toLocaleTimeString();
    return `${formattedDate} ${formattedTime}`;
  }

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    const observerInstance = new IntersectionObserver(handleScroll, options);

    if (observerInstance && loadingRef.current) {
      observerInstance.observe(loadingRef.current);
    }

    return () => {
      if (observerInstance && loadingRef.current) {
        observerInstance.unobserve(loadingRef.current);
      }
    };
  }, [loading]);

  if (!participant) return null;
  if (!canViewMessages) {
    return <div>Not authorized</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div>
        <h1>Thread</h1>
        {loading && <p>Loading messages...</p>}
        {!loading && <p>Messages loaded</p>}
        {threadId}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div id="loading" style={{ height: "20px" }} ref={loadingRef}></div>
        {messages?.map((message) => (
          <div
            ref={lastFetchedBatchesLastId === message.id ? scrollRef : null}
            key={message.id}
            className={`p-4 m-4 bg-gray-100 w-2/3 rounded-lg ${
              getMessageSender(message)?.isSelfMessage ? "ml-auto" : "mr-auto"
            }`}
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <img
                  className="w-8 h-8 bg-gray-300 rounded-full"
                  src={getMessageSender(message)?.imageUrl || ""}
                  alt=""
                />
                <p>{`${getMessageSender(message)?.firstName} ${getMessageSender(message)?.lastName}`}</p>
              </div>

              <div>
                <p>{message.content}</p>
                {/* sent at 2024-10-08T17:35:01.811539+00:00 format it*/}
                <p className="text-xs font-light">
                  {formatMessageDate(message.sent_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-4 p-4">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          type="text"
          className="w-full border border-gray-300 rounded p-2 "
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={sendingText ? true : false}
          onClick={sendMessage}
        >
          {sendingText ? (
            <CircleDashed size={24} className="animate-spin" />
          ) : (
            <ArrowRight size={24} />
          )}
        </button>
      </div>
    </div>
  );
}
