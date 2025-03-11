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

// Generate a storage key based on a label or query
// @param {String} label - The label
// @param {String} query - The search query
// @returns {String} - The storage key
function createStorageKey (query = null, label = null) {
  if (query) return `postData-query${generateHash(query)}`
  if (label) return `postData-label${generateHash(label)}`

  return 'postData'
}

// Set data in local storage as JSON
// @param {Object} data - The data to store
// @param {String} label - The label
// @param {String} query - The search query
// @returns {void}
export function setStoredData (data, query, label) {
  const STORAGE_KEY = createStorageKey(query, label)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Get data from local storage as JSON
// @param {String} label - The label
// @param {String} query - The search query
// @returns {Object} - The stored data
export function getStoredData (query, label) {
  const STORAGE_KEY = createStorageKey(query, label)
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
}
