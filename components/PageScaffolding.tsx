import { useUser } from "@clerk/nextjs";
import { ReactNode } from "react";
import Header from "./Header";
import Navbar, { NavbarProps } from "./NavBar";

export default function PageScaffold({
  route,
  children,
}: {
  route: "/home" | "/newsfeed" | "/messages";
  children: ReactNode;
}) {
  return (
    <div className="h-dvh max-h-dvh flex flex-col">
      {/* header */}
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      <Navbar route={route} />
    </div>
  );
}
