declare module 'blogger-numeric-pager' {
  interface PagerOptions {
    entriesSelector?: string;
    entrySelector?: string;
    pagerSelector?: string;
    numberSelector?: string;
    numberClass?: string;
    dotsClass?: string;
    activeClass?: string;
    totalVisibleNumbers?: number;
    checkForUpdates?: boolean;
    maxResults?: number;
    label?: string;
    query?: string;
  }

  class NumericPager {
    constructor(options?: PagerOptions);
    init(): Promise<void>;
  }

  export default NumericPager;
}
