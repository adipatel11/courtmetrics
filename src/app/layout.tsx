import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "Tennis Stats Visualizer",
  description: "Upload tennis match stats and visualize your game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <main className="mx-auto max-w-6xl p-6">{children}</main>
      </body>
    </html>
  );
}
