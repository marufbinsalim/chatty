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

export default function Thread() {
  const router = useRouter();
  const [threadId, setThreadId] = useState<string | null>(
    router.query.thread_id as string | null,
  );
  const { user } = useUser();
  const { participant, canViewMessages } = useMessenger(threadId, user?.id);
  const [messages, setMessages] = useState<
    { id: number; content: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const canLoadMore = useRef<boolean>(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [lastFetchedBatchesLastId, setLastFetchedBatchesLastId] = useState<
    number | null
  >(null);
  const [inputText, setInputText] = useState<string>("");
  const [sendingText, setSendingText] = useState<Boolean>(false);

  // fetch messages from the server should be done here that will take some time to load
  // use timeout to simulate the loading time
  const fetchMessages = async (pageNum: number) => {
    setLoading(true);
    canLoadMore.current = false;
    let lastId: number | null = null;
    setTimeout(() => {
      const start = (pageNum - 1) * 100;
      const newMessages = mockMessages.slice(start, start + 100);
      // make sure newMessages[index] exists

      lastId = newMessages[newMessages.length - 1]
        ? newMessages[newMessages.length - 1].id
        : null;
      console.log("lastId", lastId);
      setLastFetchedBatchesLastId(lastId);
      setMessages((prevMessages) => {
        if (!prevMessages) return newMessages;
        return [...newMessages, ...prevMessages];
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (!lastFetchedBatchesLastId) return;
    console.log("lastFetchedBatchesLastId changed", lastFetchedBatchesLastId);
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

    console.log("newMessageData", newMessageData, newMessageError);

    setInputText("");
    setSendingText(false);
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
          >
            {message.content}
            {lastFetchedBatchesLastId === message.id && " last fetched"}
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
