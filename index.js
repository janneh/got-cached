import got from 'got'

/*
* Returns `got` wrapped with cache to be used as normal got
*/

export default function gotCached(config) {
  if (!config.cache) throw Error('cache is a required option')
  const { cache } = config

  function setCache(key, response, options) {
    const promise = response.then(response => {
      const value = options.json
        ? JSON.stringify(response.body)
        : response.body
      cache.set(key, value)

      return Promise.resolve(response)
    })

    return promise
  }

  function getCache(key, options) {
    const promise = cache.get(key).then(value => {
      if (!value) return null
      if (options.json) value = JSON.parse(value)

      return Promise.resolve({
        status: 200,
        body: value
      })
    })

    return promise
  }

  const cachedGot = function(url, options = {}) {
    // return plain got for non-GET requests
    if (options.method && options.method !== 'GET') {
      return got(url, options)
    }

    const cachedResponse = getCache(url, options)
      .then((cached) => {
        // return the cached result if it exist
        if(cached) return cached

        // return got response but first set cache with it
        return setCache(url, got(url, options), options)
      })

    return cachedResponse
  }

  return Object.assign(cachedGot, got)
}
