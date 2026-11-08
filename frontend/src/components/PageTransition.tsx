"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="app-page-transition flex-grow-1 d-flex flex-column">
      {children}
    </div>
  );
}
