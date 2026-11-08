"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import NavIcon from "@/components/NavIcon";
import NavPersonSelect from "@/components/NavPersonSelect";
import PageTransition from "@/components/PageTransition";

const NAV_ITEMS = [
  { href: "/browser", label: "Browse", icon: "browse" as const },
  { href: "/search", label: "Search", icon: "search" as const },
  { href: "/history", label: "History", icon: "history" as const },
  { href: "/publish", label: "Publish", icon: "publish" as const },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <header className="app-navbar sticky-top">
        <div className="container-fluid px-3 px-lg-4">
          <div className="d-flex flex-wrap align-items-center gap-2 gap-lg-3 py-2 py-lg-3">
            <Link
              className="navbar-brand app-brand d-inline-flex align-items-center gap-2 me-auto"
              href="/"
            >
              <span className="app-brand-mark">
                <NavIcon name="home" size={20} />
              </span>
              <span className="d-flex flex-column lh-sm">
                <span className="app-brand-title">Wyxan</span>
                <span className="app-brand-sub">Small Web</span>
              </span>
            </Link>

            <nav className="app-nav-pills" aria-label="Main">
              <ul className="nav nav-pills gap-1 flex-wrap">
                {NAV_ITEMS.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <li className="nav-item" key={item.href}>
                      <Link
                        href={item.href}
                        className={`nav-link app-nav-link d-inline-flex align-items-center gap-2${
                          active ? " active" : ""
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        <NavIcon name={item.icon} size={16} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <NavPersonSelect />
          </div>
        </div>
      </header>

      <main className="app-main flex-grow-1 d-flex flex-column">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
