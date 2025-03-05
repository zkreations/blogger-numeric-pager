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

  const dotsData = { number: '...' }

  const paginationData = numbers.map((number) => {
    return {
      number,
      activeClass: number === currentPage ? activeClass : ''
    }
  })

  if (currentPage > 1 && !numbers.includes(1)) {
    const firstPageData = {
      number: 1,
      activeClass: ''
    }

    paginationData.unshift(dotsData)
    paginationData.unshift(firstPageData)
  }

  if (currentPage < totalPages && !numbers.includes(totalPages)) {
    const lastPageData = {
      number: totalPages,
      activeClass: ''
    }

    paginationData.push(dotsData)
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
