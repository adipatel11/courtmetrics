import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import LandingClient from "@/components/auth/LandingClient";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const session = sessionCookie ? readSessionToken(sessionCookie) : null;

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-12 py-8">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-1 text-xs uppercase tracking-wide text-teal-300 mx-auto">
          Secure Tennis Analytics
        </div>
        <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
          Visualize every match with private-by-default player accounts.
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-neutral-400 md:text-base">
          Create a free login, enter match stats through a guided form, and see
          charts update instantly. Passwords are hashed server-side with bcrypt
          and your data lives safely in your own AWS DynamoDB tables.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-neutral-400">
          <div className="rounded-full border border-neutral-800 px-3 py-1">
            Bcrypt hashing
          </div>
          <div className="rounded-full border border-neutral-800 px-3 py-1">
            DynamoDB storage
          </div>
          <div className="rounded-full border border-neutral-800 px-3 py-1">
            Persistent match history
          </div>
          <div className="rounded-full border border-neutral-800 px-3 py-1">
            Session cookies
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            href="/pros"
            className="inline-flex items-center gap-2 text-sm underline underline-offset-4 text-neutral-400 hover:text-neutral-100"
          >
            See example data
          </Link>
        </div>
      </div>
      <LandingClient />
    </div>
  );
}
