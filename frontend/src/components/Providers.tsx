"use client";

import type { ReactNode } from "react";
import { AppSessionProvider } from "@/contexts/app-session-context";
import AppShell from "@/components/AppShell";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppSessionProvider>
      <AppShell>{children}</AppShell>
    </AppSessionProvider>
  );
}
