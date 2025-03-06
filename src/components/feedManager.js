import { setStoredData, getStoredData } from './storage'

// Get the total number of posts and the blog's last update date
// @param {String} homeUrl - The blog's home URL
// @param {String} query - The search query
// @param {String} label - The label
// @returns {Object} - The total number of posts and the blog's last update date
export async function fetchFeedData ({ homeUrl, query, label }) {
  const hasLabel = label ? `-/${label}?` : '?'
  const url = `${homeUrl}/feeds/posts/summary/${hasLabel}alt=json&max-results=0`
  const response = await fetch(url)
  const data = await response.json()
  const totalPosts = Number(data.feed.openSearch$totalResults.$t)
  const blogUpdated = data.feed.updated.$t

  const storedData = getStoredData(query, label)

  storedData.totalPosts = totalPosts
  storedData.blogUpdated = blogUpdated

  setStoredData(storedData, query, label)

  return {
    totalPosts,
    blogUpdated
  }
}

// Get the post dates and the total number of posts
// @param totalPosts - The total number of posts
// @param homeUrl - The blog's home URL
// @param query - The search query
// @param label - The label
// @param byDate - Sort by date
// @returns {Object} - The post dates and the total number of posts
export async function fetchPostData ({ config, totalPosts }) {
  const { homeUrl, query, label, byDate } = config

  if (totalPosts === 0) return []

  const batchSize = 150
  const numRequests = Math.ceil(totalPosts / batchSize)
  let totalSearchPosts = 0

  const fetchPromises = Array.from({ length: numRequests }, (_, i) => {
    const startIndex = i * batchSize + 1
    const hasLabel = label ? `-/${label}?` : '?'
    const hasQuery = `?q=${query}&orderby=${byDate === false ? 'relevance' : 'published'}&`
    const fetchUrl = `${homeUrl}/feeds/posts/summary/${query ? hasQuery : hasLabel}alt=json&max-results=${batchSize}&start-index=${startIndex}`

    return fetch(fetchUrl).then(response => response.json())
  })

  const responses = await Promise.all(fetchPromises)

  const postDates = responses.flatMap(data => {
    if (query) totalSearchPosts += Number(data.feed.openSearch$totalResults.$t)
    return data.feed.entry?.map(entry => entry.published.$t.replace(/\.\d+/, '')) || []
  })

  const storedData = getStoredData(query, label)

  storedData.postDates = postDates
  if (query) storedData.totalPosts = totalSearchPosts

  setStoredData(storedData, query, label)

  return {
    totalPosts: query ? totalSearchPosts : totalPosts,
    postDates
  }
}
