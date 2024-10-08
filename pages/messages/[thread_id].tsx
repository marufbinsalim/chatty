import useMessenger from "@/hooks/useMessenger";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, CircleDashed } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

// Mock data for messages
const mockMessages = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  content: `Message ${i + 1}`,
}));

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

  // use timeout to simulate the loading time
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
      // scroll to the bottom of the messages
      scrollRef.current.scrollIntoView({ behavior: "instant" });
      // wait for the scroll to finish
      setTimeout(() => {
        canLoadMore.current = true;
      }, 1000);
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
      setPage((prev) => prev + 1); // Decrement to fetch previous messages
    }
  };

  async function sendMessage() {
    if (!user) return;
    if (!participant) return;
    if (!inputText || inputText.trim() === "" || sendingText) return;
    setSendingText(true);

    // add a new message to the thread - "conversation started"
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
  } | null {
    if (message.user_id === user?.id) {
      return user
        ? {
            user_id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          }
        : null;
    } else {
      return participant;
    }
  }

  useEffect(() => {
    const options = {
      root: null, // use the viewport as the root
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
      <div className="flex-1 bg-red-200 overflow-y-auto">
        <div id="loading" style={{ height: "20px" }} ref={loadingRef}></div>
        {messages?.map((message) => (
          <div
            ref={lastFetchedBatchesLastId === message.id ? scrollRef : null}
            key={message.id}
            className="p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <p>{getMessageSender(message)?.firstName}</p>
              </div>
              <div>
                <p>{message.content}</p>
                <p>{message.sent_at}</p>
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

// -- how many messages in the thread - count
// -- last-message (end) - count
// -- batch_size - 15
// -- start (end - batch size)

// total - 100
// batch size - 10
// 1st page (start, end)
// 	90, 99
// 2nd page (start, end)
//   80, 89

// how to calculate the start and end for the next page
// 1st page - 90, 99
// 2nd page - 80, 89
// in code
//
// let count = data.count;
// let batch_size = 10;
// let start = count - batch_size;
// let end = count;
//
// let new_start = start - batch_size;
// let new_end = start;
//
//
