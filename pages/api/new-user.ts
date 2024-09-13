import { clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import createClient from "../utils/supabase/apiClient";
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
  if (!user) {
    return new NextResponse("User does not exist", { status: 404 });
  }

  let supabase = createClient(req, res);
  console.log(user);
  const { error } = await supabase.from("users").upsert([
    {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
  ]);

  console.log(error);

  res.redirect("/");
}
