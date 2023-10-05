import { CORD_USER_COOKIE } from "@/constants";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default function SignIn() {
  async function create(formData: FormData) {
    "use server";

    const name = formData.get("name");
    if (!name || typeof name !== "string") {
      return;
    }
    cookies().set(CORD_USER_COOKIE, name);
    const referer = headers().get('referer')
    if (referer){
      redirect(referer);
    }
    redirect('/')
  }

  return (
    <form action={create} >
      <div>Welcome to Cordoku</div>
      <label>
        What shall we call you? <input name="name"></input>
      </label>
      <button>Ready</button>
    </form>
  );
}
