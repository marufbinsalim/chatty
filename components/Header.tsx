import { useUser } from "@clerk/nextjs";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, isLoaded: isLoggedInUserLoaded } = useUser();

  return (
    <div className="flex justify-between items-center p-4 bg-[#333566] border-b border-gray-500 shadow-sm gap-4 w-full m-auto">
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200">
          <MessageCircle size={32} strokeWidth={1} className="text-white" />
          <p className="text-lg md:text-xl md:font-light text-white">ChattyPals</p>
        </div>
      </Link>

      {isLoggedInUserLoaded && user && (
        <div className="flex items-center gap-4">
          <p className="font-medium text-white">{user.firstName}</p>
          <Link href="/profile">
            <img
              className="rounded-full h-10 w-10 md:h-12 md:w-12 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              src={user.imageUrl}
              alt={user.fullName || ""}
              height={48}
              width={48}
            />
          </Link>
        </div>
      )}
    </div>
  );
}
