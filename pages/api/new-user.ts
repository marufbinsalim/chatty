import { clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import createClient from "@/utils/supabase/apiClient";
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

  function getRandomLettersAndNumbers(length: number) {
    let result = "_";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // see if user is already in the database
  let supabase = createClient(req, res);
  const { data, error: userFetchError } = await supabase
    .from("users")
    .select()
    .eq("id", user.id);

  async function getUsername(email: string, id: string) {
    let username = email.split("@")[0] + getRandomLettersAndNumbers(6);
    await clerkClient().users.updateUser(id, {
      unsafeMetadata: {
        username: username,
      },
    });
    return username;
  }

  if (!data || data.length === 0) {
    console.log("User not found in database");

    let username = await getUsername(
      user.emailAddresses[0].emailAddress,
      user.id,
    );

    console.log(username, userId);

    const { error } = await supabase.from("users").upsert([
      {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        username: username,
      },
    ]);

    console.error(error);
  }
  let redirectTo = "/";
  // there is a query parameter called redirect
  console.log(req.query.redirect);
  if (req.query.redirect && req.query.redirect.includes("shared")) {
    redirectTo = req.query.redirect as string;
  }

  res.redirect(redirectTo);
}
