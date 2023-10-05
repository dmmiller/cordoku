import { getClientAuthToken } from "@cord-sdk/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("id");
  const { CORD_SECRET, CORD_APP_ID } = process.env;
  if (!CORD_SECRET || !CORD_APP_ID) {
    console.error(
      "Missing CORD_SECRET or CORD_ORD_ID env variable. Get it on console.cord.com and add it to .env"
    );
    return Response.json({ clientAuthToken: null });
  }

  const user = {
    user_id: userId,
    organization_id: "lobby",
    user_details: {
      name: userId,
    },
  };

  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    ...user,
  });
  return Response.json({ clientAuthToken });
}
