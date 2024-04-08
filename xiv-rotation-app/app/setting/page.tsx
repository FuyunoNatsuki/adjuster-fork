'use client';
import { createClient } from "@/utils/supabase/client";
import { BackLinkButton } from "@/components/BackLinkButton";
export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {

  const updateUserInfo = async (id: string | undefined, newData: object) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('profiles').update(newData).eq('id', id);
    } catch(error) {

    }
  };
  const changeName = async (formData: FormData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    updateUserInfo(user?.id, { username: formData.get('userName') });
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <BackLinkButton href="/" />
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
