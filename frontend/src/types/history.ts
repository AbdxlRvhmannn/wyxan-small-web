export type HistoryVisit = {
  visitId: string;
  address: string;
  title: string;
  visitedAt: string;
  navigationType: "go" | "jump";
};

export type HistoryListResponse = {
  totalCount: number;
  visits: HistoryVisit[];
  nextCursor: string | null;
};
