import { useUser } from "@clerk/nextjs";
import { MessageCircle, MessageSquareX } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, isLoaded: isLoggedInUserLoaded } = useUser();

  return (
    <div className="flex justify-between items-center p-2 bg-gray-50 gap-4 w-full m-auto">
      <div className="flex items-center gap-2">
        <MessageCircle size={32} strokeWidth={1} />
        <p className="text-lg md:text-xl md:font-thin">ChattyPals</p>
      </div>

      {isLoggedInUserLoaded && user && (
        <div className="flex items-center gap-2">
          <p className="text-wrap font-bold">{user.firstName}</p>
          <Link href="/profile">
            <img
              className="rounded-full h-10 w-10 md:h-12 md:w-12 border border-gray-300"
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
