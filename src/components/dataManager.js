// Create page numbers
// @param currentPage - The current page
// @param totalPages - The total pages
// @param totalVisibleNumbers - The total visible numbers
// @returns {Array} - The page numbers
function generatePageNumbers ({ currentPage, totalPages, totalVisibleNumbers }) {
  const lastPage = totalPages
  const halfVisible = Math.floor(totalVisibleNumbers / 2)

  let startPage = Math.max(currentPage - halfVisible, 1)
  let endPage = Math.min(startPage + totalVisibleNumbers - 1, lastPage)

  if (lastPage <= totalVisibleNumbers) {
    startPage = 1
    endPage = lastPage
  } else if (currentPage <= halfVisible) {
    startPage = 1
    endPage = totalVisibleNumbers
  } else if (currentPage >= lastPage - halfVisible) {
    startPage = lastPage - totalVisibleNumbers + 1
    endPage = lastPage
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
}

// Create pagination data
// @param currentPage - The current page
// @param totalPages - The total pages
// @param totalVisibleNumbers - The total visible numbers
// @returns {Array} - The pagination data
export function createData ({ config, currentPage, totalPages }) {
  const { totalVisibleNumbers, activeClass } = config

  const numbers = generatePageNumbers({
    currentPage,
    totalVisibleNumbers,
    totalPages
  })

  const halfVisible = Math.floor(totalVisibleNumbers / 2)

  const createDotsData = (number) => ({
    number,
    isDots: true
  })

  const paginationData = numbers.map((number) => {
    return {
      number,
      activeClass: number === currentPage ? activeClass : ''
    }
  })

  if (currentPage > 1 && !numbers.includes(1)) {
    const prevDotsData = createDotsData(Math.max((numbers[0] + 1) - halfVisible, 1))
    const firstPageData = {
      number: 1,
      activeClass: ''
    }

    paginationData.unshift(prevDotsData)
    paginationData.unshift(firstPageData)
  }

  if (currentPage < totalPages && !numbers.includes(totalPages)) {
    const nextDotsData = createDotsData(Math.min(numbers[numbers.length - 1] + halfVisible, totalPages))
    const lastPageData = {
      number: totalPages,
      activeClass: ''
    }

    paginationData.push(nextDotsData)
    paginationData.push(lastPageData)
  }

  return paginationData
}

// Get the label from the pathname
// @param {string} pathname - The pathname
// @returns {string} - The label
function getLabelFromPathname (pathname) {
  return pathname.includes('/search/label/')
    ? pathname.split('/').pop()
    : null
}

// Convert a string to camel case
// @param {string} str - The string to convert
// @returns {string} The camel case string
function toCamelCase (str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Get data from the URL
// @param {URL} currentUrl - The current URL object
// @returns {Object} - The data object
export function getDataFromUrl (currentUrl) {
  const urlParams = currentUrl.searchParams
  const urlPathname = currentUrl.pathname

  const keys = ['max-results', 'by-date', 'updated-max', 'start', 'q']

  const data = Object.fromEntries(
    keys.map(key => {
      const newKey = key === 'q' ? 'query' : toCamelCase(key)
      const value = urlParams.get(key)
      return value !== null ? [newKey, value] : null
    }).filter(Boolean)
  )

  const label = getLabelFromPathname(urlPathname)
  if (label) data.label = label

  return data
}

// Get the results from the pager
// @param {Element} container - The pager container
// @returns {Object} - The results object
export function getResultsFromPager (container) {
  const link = Array.from(container.querySelectorAll('a'))
    .find(a => a.href.includes('max-results='))

  if (!link) return {}

  const url = new URL(link.href)
  const maxResults = url.searchParams.get('max-results')

  return { maxResults: Number(maxResults) }
}
