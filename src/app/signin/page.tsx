import { CORD_USER_COOKIE, NEXT_URL_COOKIE } from "@/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function SignIn() {
  async function create(formData: FormData) {
    "use server";

    const name = formData.get("name");
    if (!name || typeof name !== "string") {
      return;
    }
    cookies().set(CORD_USER_COOKIE, name);
    const urlCallback = cookies().get(NEXT_URL_COOKIE);
    if (urlCallback?.value) {
      cookies().delete(NEXT_URL_COOKIE);
      redirect(urlCallback.value);
    }
    redirect("/");
  }

  return (
    <form action={create}>
      <h1>Welcome to Cordoku</h1>
      <label>
        What shall we call you? <input name="name"></input>
      </label>
      <button>Ready</button>
    </form>
  );
}
