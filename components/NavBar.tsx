import { EarthIcon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";

export type NavbarProps = {
  route: "/home" | "/newsfeed" | "/messages";
};

export default function Navbar({ route }: NavbarProps) {
  return (
    <div className="flex w-max p-2 gap-8 mx-auto md:w-full justify-around md:justify-center">
      <Link href="/">
        <div className="flex flex-col items-center">
          <button className="p-2 flex gap-2 items-center hover:bg-[#4b497a] rounded-lg transition-colors">
            <EarthIcon
              strokeWidth={1}
              size={24}
              className={route === "/home" ? "text-[#7c7ce0]" : "text-gray-400"}
            />
            <p className={`hidden md:block font-semibold ${route === "/home" ? "text-[#7c7ce0]" : "text-gray-400"}`}>
              Discover
            </p>
          </button>
          {route === "/home" && (
            <div className="w-full h-1 bg-[#7c7ce0] rounded-t-md" />
          )}
        </div>
      </Link>

      <Link href="/messages">
        <div className="flex flex-col items-center">
          <button className="p-2 flex gap-2 items-center hover:bg-[#4b497a] rounded-lg transition-colors">
            <MessageCircleIcon
              strokeWidth={1}
              size={24}
              className={route === "/messages" ? "text-[#7c7ce0]" : "text-gray-400"}
            />
            <p className={`hidden md:block font-semibold ${route === "/messages" ? "text-[#7c7ce0]" : "text-gray-400"}`}>
              Messages
            </p>
          </button>
          {route === "/messages" && (
            <div className="w-full h-1 bg-[#7c7ce0] rounded-t-md" />
          )}
        </div>
      </Link>
    </div>
  );
}
