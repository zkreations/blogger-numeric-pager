import { defaults } from './config/defaults'
import { getDataFromUrl } from './components/dataManager'
import { fetchFeedData, fetchPostData } from './components/feedManager'
import { getStoredData } from './components/storage'
import { createPagination } from './components/renderer'

class NumericPager {
  constructor (options = {}) {
    this.currentUrl = new URL(window.location.href)

    this.config = {
      ...defaults,
      ...options,
      ...getDataFromUrl(this.currentUrl)
    }

    this.pagerContainer = document.querySelector(this.config.pagerSelector)
    this.numberContainer = document.querySelector(this.config.numberSelector)
    this.entriesContainer = document.querySelector(this.config.entriesSelector)
  }

  async initPagination () {
    if (!this.pagerContainer || !this.numberContainer) return

    const {
      totalVisibleNumbers,
      query,
      byDate,
      label,
      postPerPage,
      updatedMax,
      start,
      activeClass,
      numberClass,
      dotsClass
    } = this.config

    const storedData = getStoredData(query, label)

    const {
      totalPosts: storedTotal = 0,
      postDates: storedDates = [],
      blogUpdated: storedUpdated
    } = storedData

    const homeUrl = this.currentUrl.origin
    const maxResults = this.getPostPerPage() || postPerPage

    const config = {
      numberContainer: this.numberContainer,
      maxResults,
      homeUrl,
      query,
      label,
      totalVisibleNumbers,
      byDate,
      updatedMax,
      start,
      activeClass,
      numberClass,
      dotsClass
    }

    if (storedTotal && storedDates.length) {
      createPagination({
        config,
        totalPosts: storedTotal,
        postDates: storedDates
      })
    }

    const feed = await fetchFeedData({ homeUrl, query, label })

    if (feed.blogUpdated !== storedUpdated || !storedDates.length) {
      const postData = await fetchPostData({ config, totalPosts: feed.totalPosts })

      createPagination({
        config,
        totalPosts: postData.totalPosts,
        postDates: postData.postDates
      })
    }

    if (postPerPage >= feed.totalPosts) {
      this.pagerContainer.remove()
    }
  }

  getPostPerPage () {
    const { maxResults, entrySelector } = this.config
    const totalEntries = this.entriesContainer?.querySelectorAll(entrySelector).length

    return Number(maxResults) || totalEntries || null
  }
}

export default NumericPager
