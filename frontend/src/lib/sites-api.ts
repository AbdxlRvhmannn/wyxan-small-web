import { getApiBaseUrl } from "@/lib/api";
import type { PublishSiteRequest, PublishSiteResponse } from "@/types/publish";

async function parseError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = payload?.message;
  return Array.isArray(message)
    ? message.join(", ")
    : message ?? "Publish failed";
}

export async function postPublishSite(
  body: PublishSiteRequest,
): Promise<PublishSiteResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}
