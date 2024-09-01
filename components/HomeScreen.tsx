import { SignInButton } from "@clerk/nextjs";

export default function HomeScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center h-dvh py-2 bg-cover bg-center"
      style={{
        backgroundImage: "url('/world.jpg')",
      }}
    >
      <h1 className="text-3xl md:text-5xl text-white font-bold">ChattyPals</h1>
      <p className="text-white text-center mt-4 max-w-md md:text-2xl">
        A place to connect with people from all around the world.
        <br />
      </p>
      <SignInButton>
        <button className="p-2 px-4 rounded-3xl bg-white mt-6">
          Get Started
        </button>
      </SignInButton>
    </div>
  );
}
