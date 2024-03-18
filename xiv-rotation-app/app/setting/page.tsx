import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  /**
   * update user name 
   * @param {FormData} formData 
   * @returns
   */
  const changeName = async (formData: FormData) => {
    "use server";
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const user = await supabase.auth.api.getUserByCookie;

      const userName = formData.get('userName') as string;

      const data = await supabase.from('profile').select('*').eq('user_id', user.data.user?.id);
      return redirect("/login?" + data);
    } catch {
      return redirect('/login')
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>

      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action={changeName}
      >
        <label className="text-md" htmlFor="userName">
          User Name
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="userName"
          placeholder="exception taro"
          required
        />
        <button className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 hover:bg-white hover:text-green-700 active:scale-95">
          Change Your Name
        </button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
