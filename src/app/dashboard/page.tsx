import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const session = sessionCookie ? readSessionToken(sessionCookie) : null;

  if (!session) {
    redirect("/");
  }

  return <DashboardClient userEmail={session.email} />;
}
