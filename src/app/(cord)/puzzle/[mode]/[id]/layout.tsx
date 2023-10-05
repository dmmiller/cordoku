import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CORD_USER_COOKIE } from "@/constants";
import { fetchCordRESTApi } from "@/app/api/cordFetch";

async function getData(orgId: string) {
  const userIdCookie = cookies().get(CORD_USER_COOKIE);
  if (!userIdCookie) {
    redirect("/signin");
  }

  const userId = userIdCookie.value;
  const { CORD_SECRET, CORD_APP_ID } = process.env;
  if (!CORD_SECRET || !CORD_APP_ID) {
    throw new Error(
      "Missing CORD_SECRET or CORD_ORD_ID env variable. Get it on console.cord.com and add it to .env"
    );
  }
  const orgBody = {
    name: orgId,
  };
  await fetchCordRESTApi(
    `organizations/${orgId}`,
    "PUT",
    JSON.stringify(orgBody)
  );

  const addToOrgBody = {
    add: [userId],
  };
  await fetchCordRESTApi(
    `organizations/${orgId}/members`,
    "POST",
    JSON.stringify(addToOrgBody)
  );
}

export default async function PuzzleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { mode: string; id: string };
}) {
  const orgId = `${params.id}-${params.mode}`;
  await getData(orgId);
  return <>{children}</>;
}
