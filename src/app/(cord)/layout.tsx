import { cookies } from "next/headers";
import { getClientAuthToken } from "@cord-sdk/server";
import CordIntegration from "./CordIntegration";
import "./cord.css";
import "./cord-app.css";
import { CORD_USER_COOKIE } from "@/constants";

export async function getData() {
  const userId = cookies().get(CORD_USER_COOKIE);
  if (!userId) {
    throw new Error("Not authenticated. Not possible.");
  }

  const { CORD_SECRET, CORD_APP_ID } = process.env;
  if (!CORD_SECRET || !CORD_APP_ID) {
    throw new Error("Missing CORD_SECRET or CORD_ORD_ID env variable");
  }

  const user = {
    user_id: userId.value,
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
