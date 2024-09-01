import HomeScreen from "@/components/HomeScreen";
import "@/styles/globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <SignedOut>
        <HomeScreen />
      </SignedOut>
      <SignedIn>
        <Component {...pageProps} />
      </SignedIn>
    </ClerkProvider>
  );
}
