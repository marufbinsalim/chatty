import { clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // Add logic that retrieves the data for the API route
  const user = await clerkClient().users.getUser(userId);
  // let users = await clerkClient().users.getUserList({ offset: 0, limit: 10 });
  // console.log(users);
  if (!user) {
    return new NextResponse("User does not exist", { status: 404 });
  }

  res.redirect("/");
}
