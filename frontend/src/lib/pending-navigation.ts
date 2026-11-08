import type { NavigationActionResponse } from "@/types/navigation";

const STORAGE_KEY = "wyxan:pending-navigation";

export function setPendingNavigation(response: NavigationActionResponse): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(response));
}

export function consumePendingNavigation(): NavigationActionResponse | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  sessionStorage.removeItem(STORAGE_KEY);
  try {
    return JSON.parse(raw) as NavigationActionResponse;
  } catch {
    return null;
  }
}
