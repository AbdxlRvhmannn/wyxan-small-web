"use client";

import { useRouter } from "next/navigation";
import RequirePerson from "@/components/RequirePerson";
import SearchPanel from "@/components/SearchPanel";

export default function SearchPage() {
  const router = useRouter();

  function openResult(address: string) {
    router.push(`/browser?open=${encodeURIComponent(address)}`);
  }

  return (
    <RequirePerson title="Search">
      <div className="container-fluid app-page px-3 px-lg-4 py-4">
        <header className="app-page-header">
          <h1 className="app-page-title">Search</h1>
          <p className="app-page-lead">
            Search across all published websites.
          </p>
        </header>

        <SearchPanel onOpenResult={openResult} />
      </div>
    </RequirePerson>
  );
}
