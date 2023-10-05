import { fetchCordRESTApi } from "@/app/api/cordFetch";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { org_id, user_id } = await request.json();

  const orgBody = {
    name: org_id,
  };
  const createOrgResult = await fetchCordRESTApi(
    `organizations/${org_id}`,
    "PUT",
    JSON.stringify(orgBody)
  );

  const body = {
    add: [user_id],
  };
  const result = await fetchCordRESTApi(
    `organizations/${org_id}/members`,
    "POST",
    JSON.stringify(body)
  );

  return Response.json(result);
}
