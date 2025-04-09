(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BloggerPager = factory());
})(this, (function () { 'use strict';

  // Define the default values for the blog pagination
  // @type {Object}
  const defaults = {
    pagerSelector: '#blog-pager',
    numberSelector: '#pager-numbers',
    numberClass: 'pager-item',
    dotsClass: 'pager-dots',
    activeClass: 'is-active',
    totalVisibleNumbers: 6,
    checkForUpdates: true,
    enableDotsJump: true,
    byDate: 'false',
    maxResults: null,
    query: null,
    label: null,
    start: null,
    updatedMax: null
  };

  // Create page numbers
  // @param {Number} currentPage - The current page
  // @param {Number} totalPages - The total pages
  // @param {Number} totalVisibleNumbers - The total visible numbers
  // @returns {Array} - The page numbers
  function generatePageNumbers({
    currentPage,
    totalPages,
    totalVisibleNumbers
  }) {
    const lastPage = totalPages;
    const halfVisible = Math.floor(totalVisibleNumbers / 2);
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + totalVisibleNumbers - 1, lastPage);
    if (lastPage <= totalVisibleNumbers) {
      startPage = 1;
      endPage = lastPage;
    } else if (currentPage <= halfVisible) {
      startPage = 1;
      endPage = totalVisibleNumbers;
    } else if (currentPage >= lastPage - halfVisible) {
      startPage = lastPage - totalVisibleNumbers + 1;
      endPage = lastPage;
    }
    return Array.from({
      length: endPage - startPage + 1
    }, (_, i) => startPage + i);
  }

  // Create pagination data
  // @param {Object} config - The configuration object
  // @param {Number} currentPage - The current page
  // @param {Number} totalPages - The total pages
  // @returns {Array} - The pagination data
  function createData({
    config,
    currentPage,
    totalPages
  }) {
    const {
      totalVisibleNumbers,
      activeClass
    } = config;
    const numbers = generatePageNumbers({
      currentPage,
      totalVisibleNumbers,
      totalPages
    });
    const halfVisible = Math.floor(totalVisibleNumbers / 2);
    const createDotsData = number => ({
      number,
      isDots: true
    });
    const paginationData = numbers.map(number => {
      return {
        number,
        activeClass: number === currentPage ? activeClass : ''
      };
    });
    if (currentPage > 1 && !numbers.includes(1)) {
      const prevDotsData = createDotsData(Math.max(numbers[0] + 1 - halfVisible, 1));
      const firstPageData = {
        number: 1,
        activeClass: ''
      };
      paginationData.unshift(prevDotsData);
      paginationData.unshift(firstPageData);
    }
    if (currentPage < totalPages && !numbers.includes(totalPages)) {
      const nextDotsData = createDotsData(Math.min(numbers[numbers.length - 1] + halfVisible, totalPages));
      const lastPageData = {
        number: totalPages,
        activeClass: ''
      };
      paginationData.push(nextDotsData);
      paginationData.push(lastPageData);
    }
    return paginationData;
  }

  // Get the label from the pathname
  // @param {string} pathname - The pathname
  // @returns {string} - The label
  function getLabelFromPathname(pathname) {
    return pathname.includes('/search/label/') ? pathname.split('/').pop() : null;
  }

  // Convert a string to camel case
  // @param {string} str - The string to convert
  // @returns {string} The camel case string
  function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  // Normalize data from dataset attributes
  // @param {string} value - The value to normalize
  // @returns {boolean|number|null} - The normalized value
  function normalizeData(value) {
    const trimmed = value.trim();
    const predefinedValues = {
      true: true,
      false: false,
      null: null
    };
    if (trimmed in predefinedValues) {
      return predefinedValues[trimmed];
    }
    if (!isNaN(trimmed)) return Number(trimmed);
    if (trimmed === '') return null;
    return trimmed;
  }

  // Get data from the URL
  // @param {URL} currentUrl - The current URL object
  // @returns {Object} - The data object
  function getDataFromUrl(currentUrl) {
    const urlParams = currentUrl.searchParams;
    const urlPathname = currentUrl.pathname;
    const keys = ['max-results', 'by-date', 'updated-max', 'start', 'q'];
    const data = Object.fromEntries(keys.map(key => {
      const newKey = key === 'q' ? 'query' : toCamelCase(key);
      const value = urlParams.get(key);
      return value !== null ? [newKey, value] : null;
    }).filter(Boolean));
    const label = getLabelFromPathname(urlPathname);
    if (label) data.label = label;
    return data;
  }

  // Get data attributes
  // @param {Object} options - The options object
  // @param {Object} options.dataset - The dataset object
  // @returns {Object} The data attributes
  function getDataAttributes({
    dataset = {}
  } = {}) {
    const keys = ['numberClass', 'dotsClass', 'activeClass', 'totalVisibleNumbers', 'checkForUpdates', 'enableDotsJump'];
    return Object.fromEntries(keys.filter(key => dataset[key] !== undefined).map(key => [key, normalizeData(dataset[key])]));
  }

  // Get the results from the pager
  // @param {Element} container - The pager container
  // @returns {Object} - The results object
  function getResultsFromPager(container) {
    const link = Array.from(container.querySelectorAll('a')).find(a => a.href.includes('max-results='));
    if (!link) return {};
    const url = new URL(link.href);
    const maxResults = url.searchParams.get('max-results');
    return {
      maxResults: Number(maxResults)
    };
  }

  // Create a hash from a string
  // @param {string} str - The string to hash
  // @returns {string} The generated hash
  function generateHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = hash * 33 ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(36);
  }

  // Generate a storage key based on a label or query
  // @param {String} label - The label
  // @param {String} query - The search query
  // @returns {String} - The storage key
  function createStorageKey(query = null, label = null) {
    if (query) return `postData-query${generateHash(query)}`;
    if (label) return `postData-label${generateHash(label)}`;
    return 'postData';
  }

  // Set data in local storage as JSON
  // @param {Object} data - The data to store
  // @param {String} label - The label
  // @param {String} query - The search query
  // @returns {void}
  function setStoredData(data, query, label) {
    const STORAGE_KEY = createStorageKey(query, label);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Get data from local storage as JSON
  // @param {String} label - The label
  // @param {String} query - The search query
  // @returns {Object} - The stored data
  function getStoredData(query, label) {
    const STORAGE_KEY = createStorageKey(query, label);
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  }

  // Get the total number of posts and the blog's last update date
  // @param {String} homeUrl - The blog's home URL
  // @param {String} query - The search query
  // @param {String} label - The label
  // @returns {Object} - The total number of posts and the blog's last update date
  async function fetchFeedData({
    homeUrl,
    query,
    label
  }) {
    const hasLabel = label ? `-/${label}?` : '?';
    const url = `${homeUrl}/feeds/posts/summary/${hasLabel}alt=json&max-results=0`;
    const response = await fetch(url);
    const data = await response.json();
    const totalPosts = Number(data.feed.openSearch$totalResults.$t);
    const blogUpdated = data.feed.updated.$t;
    const storedData = getStoredData(query, label);
    if (!query) storedData.totalPosts = totalPosts;
    storedData.blogUpdated = blogUpdated;
    setStoredData(storedData, query, label);
    return {
      totalPosts,
      blogUpdated
    };
  }

  // Get the post dates and the total number of posts
  // @param {Object} config - The configuration object
  // @param {Number} totalPosts - The total number of posts
  // @returns {Object} - The post dates and the total number of posts
  async function fetchPostData({
    config,
    totalPosts
  }) {
    const {
      homeUrl,
      query,
      label,
      byDate
    } = config;
    if (totalPosts === 0) return [];
    const batchSize = 150;
    const numRequests = Math.ceil(totalPosts / batchSize);
    let totalSearchPosts = 0;
    const fetchPromises = Array.from({
      length: numRequests
    }, (_, i) => {
      const startIndex = i * batchSize + 1;
      const hasLabel = label ? `-/${label}?` : '?';
      const hasQuery = `?q=${query}&orderby=${byDate === false ? 'relevance' : 'published'}&`;
      const fetchUrl = `${homeUrl}/feeds/posts/summary/${query ? hasQuery : hasLabel}alt=json&max-results=${batchSize}&start-index=${startIndex}`;
      return fetch(fetchUrl).then(response => response.json());
    });
    const responses = await Promise.all(fetchPromises);
    const postDates = responses.flatMap(data => {
      if (query) totalSearchPosts += Number(data.feed.openSearch$totalResults.$t);
      return data.feed.entry?.map(entry => entry.published.$t.replace(/\.\d+/, '')) || [];
    });
    const storedData = getStoredData(query, label);
    storedData.postDates = postDates;
    if (query) storedData.totalPosts = totalSearchPosts;
    setStoredData(storedData, query, label);
    return {
      totalPosts: query ? totalSearchPosts : totalPosts,
      postDates
    };
  }

  // Get the total number of pages
  // @param {Number} totalResults - The total number of results
  // @param {Number} maxResults - The maximum number of results
  // @returns {Number} - The total number of pages
  function getTotalPages(totalResults, maxResults) {
    return Math.ceil(Number(totalResults) / maxResults);
  }

  // Get the updated max date
  // @param {Number} number - The page number
  // @param {Array} postDates - The post dates
  // @param {Number} maxResults - The maximum number of results
  // @returns {String} - The updated max date
  function getUpdatedMax(number, postDates, maxResults) {
    const dateIndex = (number - 1) * maxResults - 1;
    return Array.isArray(postDates) && postDates[dateIndex] ? encodeURIComponent(postDates[dateIndex]) : null;
  }

  // Get the first page URL
  // @param {String} homeUrl - The blog's home URL
  // @param {String} label - The label
  // @param {String} query - The query
  // @param {Number} maxResults - The maximum number of results
  // @param {Boolean} byDate - Sort by date
  // @returns {String} - The first page URL
  function getFirstPageUrl({
    homeUrl,
    label,
    query,
    maxResults,
    byDate
  }) {
    if (label) return `${homeUrl}/search/label/${label}?max-results=${maxResults}`;
    if (query) return `${homeUrl}/search?q=${query}&max-results=${maxResults}&by-date=${byDate}`;
    return homeUrl;
  }

  // Get the base URL
  // @param {String} label - The label
  // @param {String} query - The query
  // @returns {String} - The base URL
  function getBaseUrl(label, query) {
    if (label) return `/search/label/${label}?`;
    if (query) return `/search?q=${query}&`;
    return '/search?';
  }

  // Generate the page link
  // @param {Object} config - The configuration object
  // @param {Number} number - The page number
  // @param {Array} postDates - The post dates
  // @returns {String} - The page link
  function generatePageLink({
    config,
    number,
    postDates
  }) {
    const {
      homeUrl,
      label,
      query,
      maxResults,
      byDate
    } = config;
    if (number === 1) {
      return getFirstPageUrl({
        homeUrl,
        label,
        query,
        maxResults,
        byDate
      });
    }
    const updatedMax = getUpdatedMax(number, postDates, maxResults);
    if (!updatedMax) return '#fetching';
    return `${homeUrl}${getBaseUrl(label, query)}updated-max=${updatedMax}&max-results=${maxResults}&start=${(number - 1) * maxResults}&by-date=${byDate}`;
  }

  // Get the current page from the URL
  // @param {Object} config - The configuration object
  // @param {Array} postDates - The post dates
  // @returns {Number} - The current page number
  function getCurrentPageFromUrl({
    config,
    postDates
  }) {
    const {
      query,
      maxResults,
      updatedMax,
      start
    } = config;
    if (!updatedMax && !start) return 1;

    // Filter the post dates to get the updatedMax
    const filteredPostDates = postDates.filter((_, index) => (index + 1) % maxResults === 0);
    const pageIndex = filteredPostDates.indexOf(updatedMax);
    const pageFromStart = start && query ? Math.ceil(start / maxResults) + 1 : null;
    const pageFromUpdatedMax = pageIndex !== -1 ? pageIndex + 2 : null;
    return pageFromStart ?? pageFromUpdatedMax ?? 1;
  }

  // Update the pagination
  // @param {Object} config - The configuration object
  // @param {Array} postDates - The post dates
  // @param {Number} pageNumber - The page number
  // @returns {void}
  function updatePagination({
    config,
    postDates,
    pageNumber
  }) {
    const {
      maxResults
    } = config;
    const totalPages = getTotalPages(postDates.length, maxResults);
    const paginationData = createData({
      config,
      currentPage: pageNumber,
      totalPages
    });
    renderPagination({
      config,
      paginationData,
      postDates
    });
  }

  // Render the pagination
  // @param {Object} config - The configuration object
  // @param {Array} paginationData - The pagination data
  // @param {Array} postDates - The post dates
  // @returns {void}
  function renderPagination({
    config,
    paginationData,
    postDates
  }) {
    if (!paginationData.length) return;
    const {
      numberContainer,
      numberClass,
      dotsClass,
      enableDotsJump
    } = config;
    const fragment = document.createDocumentFragment();
    const createPageLink = ({
      number,
      activeClass
    }) => {
      const link = document.createElement('a');
      link.className = `${numberClass} ${activeClass}`.trim();
      link.textContent = number;
      link.href = generatePageLink({
        config,
        number,
        postDates
      });
      return link;
    };
    const createDots = pageNumber => {
      const dots = document.createElement(enableDotsJump ? 'button' : 'span');
      dots.className = dotsClass;
      dots.textContent = '...';
      dots.dataset.page = pageNumber;
      if (enableDotsJump) {
        dots.addEventListener('click', event => {
          event.preventDefault();
          updatePagination({
            config,
            postDates,
            pageNumber
          });
        });
      }
      return dots;
    };
    paginationData.forEach(item => {
      fragment.appendChild(item.isDots ? createDots(item.number) : createPageLink(item));
    });
    numberContainer.innerHTML = '';
    numberContainer.appendChild(fragment);
  }

  // Create the pagination
  // @param {Object} config - The configuration object
  // @param {Number} totalPosts - The total number of posts
  // @param {Array} postDates - The post dates
  // @returns {void}
  function createPagination({
    config,
    totalPosts,
    postDates
  }) {
    const {
      maxResults
    } = config;
    const totalPages = getTotalPages(totalPosts, maxResults);
    const currentPage = getCurrentPageFromUrl({
      config,
      postDates
    });
    const paginationData = createData({
      config,
      currentPage,
      totalPages
    });
    renderPagination({
      config,
      paginationData,
      postDates
    });
  }

  class BloggerPager {
    constructor(options = {}) {
      this.currentUrl = new URL(window.location.href);
      this.config = {
        ...defaults,
        ...options,
        ...getDataFromUrl(this.currentUrl),
        homeUrl: this.currentUrl.origin
      };
      this.pagerContainer = document.querySelector(this.config.pagerSelector);
      this.numberContainer = document.querySelector(this.config.numberSelector);
    }
    async init() {
      if (!this.pagerContainer || !this.numberContainer) return;
      const {
        query,
        label,
        homeUrl
      } = this.config;
      const storedData = getStoredData(query, label);
      const {
        totalPosts: storedTotal = 0,
        postDates: storedDates = [],
        blogUpdated: storedUpdated
      } = storedData;
      const config = {
        ...this.config,
        ...getResultsFromPager(this.pagerContainer),
        ...getDataAttributes(this.pagerContainer),
        numberContainer: this.numberContainer
      };
      const checkForUpdates = config.checkForUpdates;
      const hasStoredData = storedTotal && storedDates.length;
      if (hasStoredData) {
        createPagination({
          config,
          totalPosts: storedTotal,
          postDates: storedDates
        });
      }
      if (hasStoredData && !checkForUpdates) {
        if (config.maxResults >= storedTotal) this.pagerContainer.remove();
        return;
      }

      // Continue if there is no stored data or we want to check for updates
      const feed = await fetchFeedData({
        homeUrl,
        query,
        label
      });
      if (feed.blogUpdated !== storedUpdated || !storedDates.length) {
        const postData = await fetchPostData({
          config,
          totalPosts: feed.totalPosts
        });
        createPagination({
          config,
          totalPosts: postData.totalPosts,
          postDates: postData.postDates
        });
      }
      if (config.maxResults >= (storedTotal || feed.totalPosts)) {
        this.pagerContainer.remove();
      }
    }
  }

  return BloggerPager;

}));
