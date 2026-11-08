export type NavigationState = {
  canGoBack: boolean;
  canGoForward: boolean;
};

export type Website = {
  address: string;
  title: string;
  html: string;
};

export type NavigationActionResponse = {
  entryId: string;
  address: string;
  website: Website;
  navigation: NavigationState;
  scrollY: number;
};

export type NavigationCurrentResponse =
  | NavigationActionResponse
  | {
      entryId: null;
      address: string;
      website: null;
      navigation: NavigationState;
      scrollY: number;
    };

export type NavigationGoRequest = {
  personId: string;
  address: string;
  scrollY?: number;
};

export type NavigationPersonRequest = {
  personId: string;
  scrollY?: number;
};
