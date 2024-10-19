import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import createClient from "@/utils/supabase/apiClient";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // return 3 users as a sample
  let supabase = createClient(req, res);
  const { data, error: userFetchError } = await supabase
    .from("users")
    .select()
    .limit(3);

  res.json({ data, userFetchError });
}
