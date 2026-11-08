import { getApiBaseUrl } from "@/lib/api";
import type {
  NavigationActionResponse,
  NavigationCurrentResponse,
} from "@/types/navigation";

async function parseError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = payload?.message;
  return Array.isArray(message)
    ? message.join(", ")
    : message ?? "Navigation failed";
}

export async function fetchNavigationCurrent(
  personId: string,
): Promise<NavigationCurrentResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/navigation/current?personId=${encodeURIComponent(personId)}`,
  );
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function postNavigationGo(
  personId: string,
  address: string,
  scrollY: number,
): Promise<NavigationActionResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/navigation/go`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId, address, scrollY }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function postNavigationBack(
  personId: string,
  scrollY: number,
): Promise<NavigationActionResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/navigation/back`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId, scrollY }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function postNavigationForward(
  personId: string,
  scrollY: number,
): Promise<NavigationActionResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/navigation/forward`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId, scrollY }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}
