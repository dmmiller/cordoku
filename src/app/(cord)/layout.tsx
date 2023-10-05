import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClientAuthToken } from "@cord-sdk/server";
import CordIntegration from "./CordIntegration";
import "./cord.css";
import "./cord-app.css";
import { CORD_USER_COOKIE } from "@/constants";

export async function getData() {
  const userId = cookies().get(CORD_USER_COOKIE);
  if (!userId) {
    redirect("/signin_old");
  }

  const { CORD_SECRET, CORD_APP_ID } = process.env;
  if (!CORD_SECRET || !CORD_APP_ID) {
    throw new Error(
      "Missing CORD_SECRET or CORD_ORD_ID env variable. Get it on console.cord.com and add it to .env"
    );
  }

  const user = {
    user_id: userId.value,
    organization_id: "lobby",
    user_details: {
      name: userId.value,
    },
  };

  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    ...user,
  });

  return { clientAuthToken };
}

export default async function CordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clientAuthToken } = await getData();
  return (
    <CordIntegration clientAuthToken={clientAuthToken}>
      {children}
    </CordIntegration>
  );
}
