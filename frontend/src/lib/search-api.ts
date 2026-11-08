import { getApiBaseUrl } from "@/lib/api";
import type { SearchResponse } from "@/types/search";

async function parseError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = payload?.message;
  return Array.isArray(message)
    ? message.join(", ")
    : message ?? "Search failed";
}

export async function fetchSearch(
  query: string,
  page = 1,
  limit = 20,
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit),
  });
  const response = await fetch(
    `${getApiBaseUrl()}/api/search?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}
