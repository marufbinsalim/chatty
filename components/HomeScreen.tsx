import { SignInButton } from "@clerk/nextjs";

export default function HomeScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen py-2 bg-cover bg-center"
      style={{
        backgroundImage: "url('/world.jpg')",
      }}
    >
      <h1 className="text-5xl text-white font-bold uppercase">ChattyPals</h1>
      <SignInButton>
        <button className="text-white">
          <p>
            <span className="text-2xl underline">Sign in</span> to get started
          </p>
        </button>
      </SignInButton>
    </div>
  );
}
