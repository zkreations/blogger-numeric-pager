import { defaults } from './config/defaults'
import { getDataFromUrl } from './components/dataManager'
import { fetchFeedData, fetchPostData } from './components/feedManager'
import { getStoredData } from './components/storage'
import { createPagination } from './components/renderer'

class BloggerPager {
  constructor (options = {}) {
    this.currentUrl = new URL(window.location.href)

    this.config = {
      ...defaults,
      ...options,
      ...getDataFromUrl(this.currentUrl),
      homeUrl: this.currentUrl.origin
    }

    const {
      pagerSelector,
      numberSelector,
      entriesSelector,
      entrySelector
    } = this.config

    this.pagerContainer = document.querySelector(pagerSelector)
    this.numberContainer = document.querySelector(numberSelector)
    this.entriesContainer = document.querySelector(entriesSelector)

    this.postPerPage = this.entriesContainer
      ?.querySelectorAll(entrySelector).length

    this.totalEntries = Number(this.config.maxResults) || this.postPerPage || null
  }

  async init () {
    if (!this.pagerContainer || !this.numberContainer) return

    const { query, label, homeUrl, checkForUpdates } = this.config
    const storedData = getStoredData(query, label)

    const {
      totalPosts: storedTotal = 0,
      postDates: storedDates = [],
      blogUpdated: storedUpdated
    } = storedData

    const config = {
      ...this.config,
      numberContainer: this.numberContainer,
      maxResults: this.totalEntries
    }

    const hasStoredData = storedTotal && storedDates.length

    if (hasStoredData) {
      createPagination({ config, totalPosts: storedTotal, postDates: storedDates })
    }

    // If there is stored data and we don't want to check for updates, we can stop here
    if (hasStoredData && !checkForUpdates) {
      if (config.maxResults >= storedTotal) this.pagerContainer.remove()
      return
    }

    // Continue if there is no stored data or we want to check for updates
    const feed = await fetchFeedData({ homeUrl, query, label })

    if (feed.blogUpdated !== storedUpdated || !storedDates.length) {
      const postData = await fetchPostData({ config, totalPosts: feed.totalPosts })
      createPagination({ config, totalPosts: postData.totalPosts, postDates: postData.postDates })
    }

    if (config.maxResults >= (storedTotal || feed.totalPosts)) {
      this.pagerContainer.remove()
    }
  }
}

export default BloggerPager
