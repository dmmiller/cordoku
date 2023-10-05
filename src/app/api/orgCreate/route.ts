import { fetchCordRESTApi } from "@/app/api/cordFetch";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  const { id } = await request.json();
  const orgBody = {
    name: id,
  };
  const result = await fetchCordRESTApi(
    `organizations/${id}`,
    "PUT",
    JSON.stringify(orgBody)
  );

  return Response.json(result);
}
