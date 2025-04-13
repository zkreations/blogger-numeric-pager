const GLOBAL_STORAGE_KEY = 'bloggerPagination'

// Check if localStorage is available
// @returns {object} - The localStorage object or null if not available
function getCache () {
  try {
    const raw = localStorage.getItem(GLOBAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.warn('Invalid localStorage data, resetting cache', e)
    localStorage.removeItem(GLOBAL_STORAGE_KEY)
    return {}
  }
}

// Create a hash from a string
// @param {string} str - The string to hash
// @returns {string} The generated hash
function generateHash (str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

// Generate key based on a label or query
// @param {String} label - The label
// @param {String} query - The search query
// @returns {String} - The generated key
function createKey (query = null, label = null) {
  if (query) return `query${generateHash(query)}`
  if (label) return `label${generateHash(label)}`
  return 'all'
}

// Set data in local storage as JSON
// @param {Object} data - The data to store
// @param {String} label - The label
// @param {String} query - The search query
// @returns {void}
export function setStoredData (data, query = null, label = null) {
  const key = createKey(query, label)
  const cache = getCache()

  cache[key] = data

  localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(cache))
}

// Get data from local storage as JSON
// @param {String} label - The label
// @param {String} query - The search query
// @returns {Object} - The stored data
export function getStoredData (query = null, label = null) {
  const key = createKey(query, label)
  const cache = getCache()

  return cache[key] || {
    totalPosts: 0,
    postDates: [],
    blogUpdated: null
  }
}
