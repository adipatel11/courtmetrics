"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinksProps = {
  isAuthenticated: boolean;
};

const navItems = [
  {
    href: "/pros",
    label: "Pros ↗",
    showWhen: () => true,
    isActive: (pathname: string) => pathname.startsWith("/pros"),
  },
  {
    href: "/dashboard",
    label: "Dashboard ↗",
    showWhen: (isAuthenticated: boolean) => isAuthenticated,
    isActive: (pathname: string) =>
      pathname === "/dashboard" || pathname === "/" || pathname.startsWith("/dashboard"),
  },
  {
    href: "/#auth",
    label: "Get started ↗",
    showWhen: (isAuthenticated: boolean) => !isAuthenticated,
    isActive: (pathname: string) => pathname === "/",
  },
];

export default function NavLinks({ isAuthenticated }: NavLinksProps) {
  const pathname = usePathname() || "/";

  return (
    <nav className="flex items-center gap-4 text-sm text-neutral-300">
      {navItems
        .filter((item) => item.showWhen(isAuthenticated) && !item.isActive(pathname))
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="underline underline-offset-4 transition-colors hover:text-neutral-50"
          >
            {item.label}
          </Link>
        ))}
    </nav>
  );
}
