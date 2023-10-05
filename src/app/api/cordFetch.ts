import { getServerAuthToken } from "@cord-sdk/server";

export async function fetchCordRESTApi(
  endpoint: string,
  method: "GET" | "PUT" | "POST" | "DELETE" = "GET",
  body?: string
): Promise<T> {
  const { CORD_SECRET, CORD_APP_ID } = process.env;
  if (!CORD_SECRET || !CORD_APP_ID) {
    throw new Error(
      "Missing CORD_SECRET or CORD_ORD_ID env variable. Get it on console.cord.com and add it to .env"
    );
  }

  const serverAuthToken = getServerAuthToken(CORD_APP_ID, CORD_SECRET);
  const headers = {
    Authorization: `Bearer ${serverAuthToken}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(`https://api.cord.com/v1/${endpoint}`, {
    method,
    body,
    headers,
  });

  if (response.ok) {
    return response.json() as T;
  } else {
    const responseText = await response.text();
    throw new Error(
      `Error making Cord API call: ${response.status} ${response.statusText} ${responseText}`
    );
  }
}
