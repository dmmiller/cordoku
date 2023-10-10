import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CORD_USER_COOKIE } from "@/constants";
import { fetchCordRESTApi } from "@/app/api/cordFetch";
import { Mode } from "@/app/(cord)/puzzle/Puzzles";
import { buildOrgId } from "@/app/(cord)/puzzle/utils";
import { getClientAuthToken } from "@cord-sdk/server";
import CordIntegration from "@/app/(cord)/CordIntegration";

async function getData(mode: Mode, id: string) {
  const userIdCookie = cookies().get(CORD_USER_COOKIE);
  if (!userIdCookie) {
    redirect("/signin");
  }

  const { CORD_SECRET, CORD_APP_ID } = process.env;
  if (!CORD_SECRET || !CORD_APP_ID) {
    throw new Error(
      "Missing CORD_SECRET or CORD_ORD_ID env variable. Get it on console.cord.com and add it to .env"
    );
  }

  const userId = userIdCookie.value;
  const orgId = buildOrgId(mode, id);
  const orgBody = {
    name: orgId,
  };
  await fetchCordRESTApi(
    `organizations/${orgId}`,
    "PUT",
    JSON.stringify(orgBody)
  );

  const addToOrgBody = {
    add: [userId, "gm"],
  };
  await fetchCordRESTApi(
    `organizations/${orgId}/members`,
    "POST",
    JSON.stringify(addToOrgBody)
  );

  const user = {
    user_id: userId,
    user_details: {
      name: userId,
    },
  };

  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    ...user,
  });

  return { clientAuthToken };
}

export default async function PuzzleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { mode: Mode; id: string };
}) {
  const { clientAuthToken } = await getData(params.mode, params.id);
  return (
    <CordIntegration clientAuthToken={clientAuthToken}>
      {children}
    </CordIntegration>
  );
}
