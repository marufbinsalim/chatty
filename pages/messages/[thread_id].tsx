import useMessenger from "@/hooks/useMessenger";
import { supabase } from "@/utils/supabase/uiClient";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  CircleDashed,
  Laugh,
  LaughIcon,
  LucideLaugh,
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
  if (!user) return null;
  if (!canViewMessages) {
    return <div>Not authorized</div>;
  }

  return (
    <div className="flex flex-col h-dvh">
      <div
        className={`lg:flex items-center p-4 bg-gray-200 space-x-2 ${selectedWindow === "PROFILE_WINDOW" ? "hidden" : "flex"}`}
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
      <div className="flex flex-1 overflow-y-hidden">
        <div className="bg-blue-50 w-[300px] hidden lg:block">threads bar</div>
        {/* the main chat area */}
        <div
          className={`bg-red-50 flex-1 lg:flex flex-col ${selectedWindow === "PROFILE_WINDOW" ? "hidden" : "flex"}`}
        >
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <CircleDashed className="m-auto mt-4 animate-spin" size={32} />
            )}
            <div id="loading" style={{ height: "20px" }} ref={loadingRef}></div>
            {messages?.map((message) => (
              <div
                ref={lastFetchedBatchesLastId === message.id ? scrollRef : null}
                key={message.id}
                className={`p-4 m-4 bg-gray-100 w-2/3 rounded-lg ${
                  getMessageSender(message)?.isSelfMessage
                    ? "ml-auto"
                    : "mr-auto"
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
                    <p className="text-xs font-light">
                      {formatMessageDate(message.sent_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4 p-4 relative">
            <input
              value={inputText}
              onFocus={() => setShowPicker(false)}
              onChange={(e) => setInputText(e.target.value)}
              type="text"
              className="w-full border border-gray-300 rounded p-2 "
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
                <ArrowRight size={24} />
              )}
            </button>
          </div>
        </div>
        <div
          className={`w-full lg:w-[300px] overflow-hidden lg:flex ${selectedWindow === "PROFILE_WINDOW" ? "flex" : "hidden"}`}
        >
          <div className="flex flex-col p-4 w-full">
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
                {participant.firstName} {participant.lastName}
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
