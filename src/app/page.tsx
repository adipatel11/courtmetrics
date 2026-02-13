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
          Visualize every match with powerful, personalized tennis analytics.
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-neutral-400 md:text-base">
          Create a free login, enter match stats through a guided form, and see
          your progress update instantly across every session.
        </p>
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
