import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import "./globals.css";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";
import NavLinks from "@/components/navigation/NavLinks";

export const metadata: Metadata = {
  title: "CourtMetrics",
  description:
    "Upload tennis match stats, visualize performance, and manage secure player accounts.",
  icons: {
    icon: "/favicon-teal.svg",
    shortcut: "/favicon-teal.svg",
  },
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
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-teal-500">
                <Image
                  src="/tennis-racket-icon-simple-style-vector.png"
                  alt="CourtMetrics logo"
                  width={32}
                  height={32}
                  priority
                />
              </span>
              CourtMetrics
            </Link>
            <NavLinks isAuthenticated={Boolean(session)} />
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
