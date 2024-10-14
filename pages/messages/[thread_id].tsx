import useMessenger from "@/hooks/useMessenger";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  CircleDashed,
  Hand,
  Laugh,
  LaughIcon,
  LucideLaugh,
  Search,
  SearchIcon,
  Send,
  SendHorizonalIcon,
  SendIcon,
  Smile,
  XCircle,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/router";
import {
  LegacyRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { formatMessageDate } from "@/utils/format/date";
import useRealtimeThreads, {
  Thread as ThreadType,
} from "@/hooks/useRealtimeThreads";
import Link from "next/link";
import { truncateString } from "@/utils/format/textPreview";

const Picker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false },
);

const FETCH_LIMIT = 15;

type Message = {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  sent_at: string;
  recipient_id: string;
};

// write a type that is either CHAT_WINDOW or PROFILE_WINDOW
type WindowType = "CHAT_WINDOW" | "PROFILE_WINDOW";

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
  const [showPicker, setShowPicker] = useState(false);
  // const inputRef = useRef<<HTMLInputElement> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedWindow, setSelectedWindow] =
    useState<WindowType>("CHAT_WINDOW");

  const onEmojiClick = (event: any) => {
    setInputText((inputText) => inputText + event.emoji);
    setShowPicker(false);

    // focus on input after emoji is selected to continue typing
    if (inputRef) {
      (inputRef as any).current.focus();
    }
  };

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

  // if threadId changes, set page to 1, clear messages, canLoadMore to true

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

    if (inputRef) {
      (inputRef as any).current.focus();
    }
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

  const { threads, searchTerm, setSearchTerm } = useRealtimeThreads(user?.id);

  function getUserInfo(thread: ThreadType) {
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

  function putActiveThreadOnTop(
    threadId: string | null,
    threads: ThreadType[] | null,
  ) {
    if (!threads) return null;
    const threadIndex = threads.findIndex((thread) => thread.id === threadId);
    if (threadIndex === -1) return threads;
    const thread = threads[threadIndex];
    threads.splice(threadIndex, 1);
    threads.unshift(thread);
    return threads;
  }

  if (!participant) return null;
  if (!user) return null;
  if (!canViewMessages) {
    return <div>Not authorized</div>;
  }

  return (
    <div className="flex flex-col h-dvh ">

      <div className="flex flex-1 overflow-y-hidden">
        <div className="w-[350px] hidden lg:flex flex-col">
          <div className="flex flex-col space-y-4 p-4 rounded-lg flex-1 overflow-hidden">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search"
                className=" p-2 pl-10 border border-gray-200 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-2 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>        

            <div className="space-y-4 flex flex-col flex-1 overflow-auto">
              {threads.length === 0 && (
                <div className="flex flex-col items-center space-y-4 flex-1 justify-center border border-gray-200 rounded-lg p-4 max-w-[90vw] m-auto md:m-0 mt-16">
                  <h1 className="text-2xl font-semibold">
                    No Messages Sent Yet!
                  </h1>
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

              {putActiveThreadOnTop(threadId, threads)?.map((thread) => {
                const { id, name, image } = getUserInfo(thread);
                return (
                  <div
                    key={thread.id}
                    className={`flex items-center space-x-4 p-4  rounded-2xl border border-gray-300 cursor-pointer mr-4 ${thread.id === threadId ? "bg-gray-100" : "bg-white"
                      }`}
                    onClick={async (e) => {
                      window.location.href = `/messages/${thread.id}`;
                    }}
                  >
                    <img
                      src={image}
                      alt={name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">{name}</h2>
                      <p className="text-gray-500">
                        {truncateString(thread.last_message_content, 30)}
                      </p>
                      <p>{formatMessageDate(thread.last_message_created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* the main chat area */}
        <div
          className={`border flex-1 lg:flex flex-col ${selectedWindow === "PROFILE_WINDOW" ? "hidden" : "flex"}`}
        >
          <div
            className={` border-none bg-gray-100 shadow-sm lg:flex items-center p-4 space-x-4 ${selectedWindow === "PROFILE_WINDOW" ? "hidden" : "flex"}`}
          >
            <button>
              <ArrowLeft
                size={24}
                onClick={(e) => {
                  router.push("/messages");
                }}
              />
            </button>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={(e) => {
                setSelectedWindow("PROFILE_WINDOW");
              }}
            >
              <img
                src={participant.imageUrl || ""}
                alt="profile"
                className="w-8 h-8 rounded-full"
              />
              <h1>
                {participant.firstName} {participant.lastName}
              </h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <CircleDashed className="m-auto mt-4 animate-spin" size={32} />
            )}
            <div id="loading" style={{ height: "20px" }} ref={loadingRef}></div>
            {messages?.length === 0 && (
              <div className="flex flex-col items-center space-y-4 flex-1 justify-center rounded-lg p-4 max-w-[90vw] m-auto md:m-0 mt-16">
                <h1 className="text-2xl font-semibold">Say Hi!</h1>
                <Link href="/">
                  <Hand
                    strokeWidth={0.8}
                    size={64}
                    className="cursor-pointer"
                  />
                </Link>
                <p className="text-gray-500 text-center">
                  {`Start a conversation with ${participant.firstName} ${participant.lastName}!`}
                </p>
              </div>
            )}

            {messages?.map((message) => (
              <div
                ref={lastFetchedBatchesLastId === message.id ? scrollRef : null}
                key={message.id}
                className={`p-4 m-4 border border-gray-300 w-2/4 max-w-max shadow-sm rounded-3xl ${getMessageSender(message)?.isSelfMessage
                  ? "ml-auto bg-blue-200" // Sent messages (self) have a light blue background
                  : "mr-auto bg-gray-200"  // Received messages have a light gray background
                  }`}
              >
                <div className="flex flex-col space-y-4">
                  {/* 
                      <div className="flex items-center space-x-2">
                        <img
                          className="w-8 h-8 bg-gray-300 rounded-full"
                          src={getMessageSender(message)?.imageUrl || ""}
                          alt=""
                        />
                        <p>{`${getMessageSender(message)?.firstName} ${getMessageSender(message)?.lastName || ""}`}</p>
                      </div> 
                  */}

                  <div>
                    <p className="text-md">{message.content}</p>
                    <p className="text-xs mt-4 font-light flex justify-end">
                      {formatMessageDate(message.sent_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          </div>
          <div className="flex mb-4 items-center space-x-4 p-4 relative">
            <input
              value={inputText}
              onFocus={() => setShowPicker(false)}
              onChange={(e) => setInputText(e.target.value)}
              type="text"
              className="w-full border border-gray-300 rounded-full p-2 "
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              ref={inputRef}
            />

            <Smile
              onClick={() => setShowPicker((val) => !val)}
              strokeWidth={1.5}
              color="black"
              fill="yellow"
              size={32}
            />

            <Picker
              open={showPicker}
              onEmojiClick={onEmojiClick}
              className="max-w-[calc(100vw-100px)]"
              style={{
                width: "300px",
                position: "absolute",
                bottom: "70px",
                right: "80px",
              }}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={sendingText ? true : false}
              onClick={sendMessage}
            >
              {sendingText ? (
                <CircleDashed size={24} className="animate-spin" />
              ) : (
                <SendHorizonalIcon size={24} />
              )}
            </button>
          </div>
        </div>
        <div
          className={`w-full lg:w-[350px] overflow-hidden lg:flex ${selectedWindow === "PROFILE_WINDOW" ? "flex" : "hidden"}`}
        >
          <div className="flex flex-col p-4 w-full rounded-lg border border-gray-200 ml-4">
            <XIcon
              size={32}
              className="cursor-pointer block ml-auto mb-4 lg:hidden"
              onClick={(e) => setSelectedWindow("CHAT_WINDOW")}
            />
            <div className="flex-1 flex flex-col overflow-auto">
              <img
                src={participant.imageUrl || ""}
                alt="profile"
                className="w-24 h-24 rounded-full mx-auto"
              />
              <p className="text-center mt-4 text-xl font-semibold">
                {participant.firstName || ""} {participant.lastName || ""}
              </p>
              <p className="text-center text-sm text-gray-500">
                @{participant.username}
              </p>
              <p className="text-center text-sm text-gray-500">
                {participant.email}
              </p>
              <p className="text-center mt-4">{participant.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
