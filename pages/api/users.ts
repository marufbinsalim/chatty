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

  // @ts-ignore
  let offset = req.query.offset ? parseInt(req.query.offset) : 0;
  // @ts-ignore
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let users = await clerkClient().users.getUserList({
    offset: offset,
    limit: limit,
  });

  if (!users) {
    return new NextResponse("User does not exist", { status: 404 });
  }

  res.json(users);
}
