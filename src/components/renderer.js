import { createData } from './dataManager'

// Get the total number of pages
// @param {Number} totalResults - The total number of results
// @param {Number} maxResults - The maximum number of results
// @returns {Number} - The total number of pages
function getTotalPages (totalResults, maxResults) {
  return Math.ceil(Number(totalResults) / maxResults)
}

// Get the updated max date
// @param {Number} number - The page number
// @param {Array} postDates - The post dates
// @param {Number} maxResults - The maximum number of results
// @returns {String} - The updated max date
function getUpdatedMax (number, postDates, maxResults) {
  const dateIndex = (number - 1) * maxResults - 1
  return Array.isArray(postDates) && postDates[dateIndex]
    ? encodeURIComponent(postDates[dateIndex])
    : null
}

// Get the first page URL
// @param homeUrl - The home URL
// @param label - The label
// @param query - The query
// @param maxResults - The maximum number of results
// @param byDate - The by date
// @returns {String} - The first page URL
function getFirstPageUrl ({ homeUrl, label, query, maxResults, byDate }) {
  if (label) return `${homeUrl}/search/label/${label}?max-results=${maxResults}`
  if (query) return `${homeUrl}/search?q=${query}&max-results=${maxResults}&by-date=${byDate}`
  return homeUrl
}

// Get the base URL
// @param label - The label
// @param query - The query
function getBaseUrl (label, query) {
  if (label) return `/search/label/${label}?`
  if (query) return `/search?q=${query}&`
  return '/search?'
}

// Generate the page link
// @param config - The configuration object
// @param number - The page number
// @param postDates - The post dates
// @returns {String} - The page link
function generatePageLink ({ config, number, postDates }) {
  const { homeUrl, label, query, maxResults, byDate } = config

  if (number === 1) {
    return getFirstPageUrl({ homeUrl, label, query, maxResults, byDate })
  }

  const updatedMax = getUpdatedMax(number, postDates, maxResults)
  if (!updatedMax) return '#fetching'

  return `${homeUrl}${getBaseUrl(label, query)}updated-max=${updatedMax}&max-results=${maxResults}&start=${(number - 1) * maxResults}&by-date=${byDate}`
}

// Get the current page from the URL
// @param config - The configuration object
// @param postDates - The post dates
// @returns {Number} - The current page
function getCurrentPageFromUrl ({ config, postDates }) {
  const { query, maxResults, updatedMax, start } = config

  if (!updatedMax && !start) return 1

  // Filter the post dates to get the updatedMax
  const filteredPostDates = postDates.filter((_, index) => (index + 1) % maxResults === 0)
  const pageIndex = filteredPostDates.indexOf(updatedMax)

  const pageFromStart = start && query
    ? Math.ceil(start / maxResults) + 1
    : null

  const pageFromUpdatedMax = pageIndex !== -1
    ? pageIndex + 2
    : null

  return pageFromStart ?? pageFromUpdatedMax ?? 1
}

// Render the pagination
// @param config - The configuration object
// @param paginationData - The pagination data
// @param postDates - The post dates
function renderPagination ({ config, paginationData, postDates }) {
  if (!paginationData.length) return

  const { numberContainer, numberClass, dotsClass } = config
  const fragment = document.createDocumentFragment()

  const createPageLink = ({ number, activeClass }) => {
    const link = document.createElement('a')
    link.className = `${numberClass} ${activeClass}`.trim()
    link.textContent = number
    link.href = generatePageLink({ config, number, postDates })
    return link
  }

  const createDots = () => {
    const dots = document.createElement('span')
    dots.className = dotsClass
    dots.textContent = '...'
    return dots
  }

  paginationData.forEach(item => {
    fragment.appendChild(
      item.number === '...' ? createDots() : createPageLink(item)
    )
  })

  numberContainer.innerHTML = ''
  numberContainer.appendChild(fragment)
}

// Create the pagination
// @param config - The configuration object
// @param totalPosts - The total number of posts
// @param postDates - The post dates
export function createPagination ({ config, totalPosts, postDates }) {
  const { maxResults } = config

  const totalPages = getTotalPages(totalPosts, maxResults)
  const currentPage = getCurrentPageFromUrl({ config, postDates })

  const paginationData = createData({ config, currentPage, totalPages })

  renderPagination({
    config,
    paginationData,
    postDates
  })
}
