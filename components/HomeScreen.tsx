import { SignInButton } from "@clerk/nextjs";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeScreen() {
  const router = useRouter();
  const currentUrl = window.location.href;
  const isItShared = currentUrl.includes("shared");
  const lastAfterSlash = currentUrl.substring(
    currentUrl.lastIndexOf("/") + 1,
    currentUrl.length,
  );

  return (
    <div
      className="flex flex-col items-center justify-center h-dvh py-2 bg-cover bg-center"
      style={{
        backgroundImage: "url('/world.jpg')",
      }}
    >
      <div className="flex items-center justify-center gap-4">
        <h1 className="text-3xl md:text-5xl text-white font-thin">
          ChattyPals
        </h1>
        <MessageCircle color="white" size={48} strokeWidth={1} />
      </div>
      <p className="text-white font-extralight text-center mt-4 max-w-md md:text-2xl">
        A place to connect with people from all around the world.
        <br />
      </p>
      <SignInButton
        forceRedirectUrl={
          isItShared
            ? `/api/new-user?redirect=/shared/${lastAfterSlash}`
            : "/api/new-user"
        }
      >
        <button className="p-2 px-4 rounded-3xl bg-white mt-6 font-thin">
          Get Started
        </button>
      </SignInButton>
    </div>
  );
}
