const STORAGE_KEY = "selectedPersonId";

export function getSelectedPersonId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setSelectedPersonId(id: string): void {
  sessionStorage.setItem(STORAGE_KEY, id);
}
