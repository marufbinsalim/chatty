import { EarthIcon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";

export type NavbarProps = {
  route: "/home" | "/newsfeed" | "/messages";
};

export default function Navbar({ route }: NavbarProps) {
  return (
    <div className="flex w-max p-2 gap-8 mx-auto md:w-full justify-around md:justify-center  ">
      {/* Discover Button */}
      <Link href="/">
        <div className="flex flex-col items-center">
          <button className="p-2 flex gap-2 items-center">
            <EarthIcon
              strokeWidth={1}
              size={24}
              className={route === "/home" ? "text-blue-500" : "text-gray-500"}
            />
            <p className={`hidden md:block font-semibold ${route === "/home" ? "text-blue-500" : "text-gray-500"}`}>
              Discover
            </p>
          </button>
          {route === "/home" && (
            <div className="w-full h-1  bg-blue-500 rounded-t-md " />
          )}
        </div>
      </Link>

      <Link href="/messages">
        <div className="flex flex-col items-center">
          <button className="p-2 flex gap-2 items-center">
            <MessageCircleIcon
              strokeWidth={1}
              size={24}
              className={route === "/messages" ? "text-blue-500" : "text-gray-500"}
            />
            <p className={`hidden md:block font-semibold ${route === "/messages" ? "text-blue-500" : "text-gray-500"}`}>
              Messages
            </p>
          </button>
          {route === "/messages" && (
            <div className="w-full h-1  bg-blue-500 rounded-t-md" />
          )}
        </div>
      </Link>
    </div>
  );
}
