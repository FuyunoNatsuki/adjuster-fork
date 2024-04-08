'use client';
import { BackLinkButton } from "@/components/BackLinkButton";
import { Loading } from "@/components/Loading";
import { useTransition } from "react";
import { signIn, signUp } from "./actions/login";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const [isPending, startTransition] = useTransition();
  const onClickSignIn = async (formData: FormData) => {
    startTransition(async () => {
      await signIn(formData);
    });
  }
  const onClickSignUp = (formData: FormData) => {
    startTransition(async () => {
      await signUp(formData);
    })
  }
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <BackLinkButton href="/"/>
      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action={onClickSignIn}
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        {isPending ? <Loading /> : (
          <>
            <button className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 hover:bg-white hover:text-green-700 active:scale-95">
              Sign In
            </button>
            <button
              formAction={onClickSignUp}
              className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2 hover:bg-gray-700 active:scale-95"
            >
              Sign Up
            </button>
            {searchParams?.message && (
              <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                {searchParams.message}
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}
