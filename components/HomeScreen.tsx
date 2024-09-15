import { SignInButton } from "@clerk/nextjs";
import { MessageCircle } from "lucide-react";

export default function HomeScreen() {
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
      <SignInButton>
        <button className="p-2 px-4 rounded-3xl bg-white mt-6 font-thin">
          Get Started
        </button>
      </SignInButton>
    </div>
  );
}
