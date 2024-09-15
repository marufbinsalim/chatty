import { EarthIcon, MessageCircleIcon, Newspaper } from "lucide-react";
import Link from "next/link";

export type NavbarProps = {
  route: "/home" | "/newsfeed" | "/messages";
};

export default function Navbar({ route }: NavbarProps) {
  return (
    <div className="flex w-full bg-gray-50 p-2 justify-around md:justify-center md:gap-8">
      <Link href="/">
        <button
          className={`p-2 flex gap-2 items-center ${route === "/home" ? "" : ""}`}
        >
          <p className="hidden md:block font-thin">Discover</p>
          <EarthIcon strokeWidth={1} size={24} />
        </button>
      </Link>

      <Link href="/messages">
        <button
          className={`p-2 flex gap-2 items-center ${route === "/messages" ? "" : ""}`}
        >
          <p className="hidden md:block font-thin">Messages</p>
          <MessageCircleIcon strokeWidth={1} size={24} />
        </button>
      </Link>
    </div>
  );
}
