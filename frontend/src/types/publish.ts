export type PublishSiteRequest = {
  personId: string;
  address: string;
  html: string;
};

export type PublishSiteResponse = {
  id: string;
  address: string;
  title: string;
  authorId: string;
  createdAt: string;
};
