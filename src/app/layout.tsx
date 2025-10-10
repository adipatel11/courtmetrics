import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tennis Stats Visualizer",
  description:
    "Upload tennis match stats, visualize performance, and manage secure player accounts.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const session = sessionCookie ? readSessionToken(sessionCookie) : null;

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col p-6">
          <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-neutral-950">
                TSV
              </span>
              Tennis Stats Visualizer
            </Link>
            <nav className="flex items-center gap-4 text-sm text-neutral-300">
              <Link
                href="/pros"
                className="hover:text-neutral-50 transition-colors"
              >
                Pros
              </Link>
              {session ? (
                <Link
                  href="/dashboard"
                  className="hover:text-neutral-50 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/#auth"
                  className="hover:text-neutral-50 transition-colors"
                >
                  Get started
                </Link>
              )}
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="pt-10 text-center text-xs text-neutral-500">
            Built with secure AWS-backed auth and rich tennis analytics.
          </footer>
        </div>
      </body>
    </html>
  );
}
