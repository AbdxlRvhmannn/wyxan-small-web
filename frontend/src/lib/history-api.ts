import { getApiBaseUrl } from "@/lib/api";
import type { HistoryListResponse } from "@/types/history";
import type { NavigationActionResponse } from "@/types/navigation";

async function parseError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = payload?.message;
  return Array.isArray(message)
    ? message.join(", ")
    : message ?? "Request failed";
}

export async function fetchBrowsingHistory(
  personId: string,
  limit: number,
  cursor?: string,
): Promise<HistoryListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  if (cursor) {
    params.set("cursor", cursor);
  }
  const response = await fetch(
    `${getApiBaseUrl()}/api/history/${encodeURIComponent(personId)}?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function postHistoryJump(
  personId: string,
  visitId: string,
  scrollY: number,
): Promise<NavigationActionResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/api/history/${encodeURIComponent(personId)}/jump`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitId, scrollY }),
    },
  );
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}
