declare module 'blogger-numeric-pager' {
  interface PagerOptions {
    pagerSelector?: string;
    numberSelector?: string;
    numberClass?: string;
    dotsClass?: string;
    activeClass?: string;
    totalVisibleNumbers?: number;
    checkForUpdates?: boolean;
    enableDotsJump?: boolean;
    byDate?: string;
    maxResults?: number | null;
    query?: string | null;
    label?: string | null;
    start?: number | null;
  }

  class NumericPager {
    constructor(options?: PagerOptions);
    init(): Promise<void>;
  }

  export default NumericPager;
}
