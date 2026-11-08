export type NavigationState = {
  canGoBack: boolean;
  canGoForward: boolean;
};

export type Website = {
  address: string;
  title: string;
  html: string;
};

export type NavigationGoResponse = {
  address: string;
  website: Website;
  navigation: NavigationState;
};

export type NavigationGoRequest = {
  personId: string;
  address: string;
};
