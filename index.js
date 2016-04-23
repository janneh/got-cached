import got from 'got'

/*
* Returns `got` wrapped with cache to be used as normal got
*/

export default function gotCached(config) {
  if (!config.cache) throw Error('cache is a required option')
  const { cache } = config

  function setCache(key, value, options) {
    if(options.json) value = JSON.stringify(value)

    cache.set(key, value)
  }

  function getCache(key, options) {
    return cache.get(key).then(value => {
      if (!value) return null
      if (options.json) value = JSON.parse(value)

      return Promise.resolve({
        status: 200,
        body: value
      })
    })
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

        // return got response after setting cache
        return got(url, options).then(response => {
          setCache(url, response.body, options)

          return Promise.resolve(response)
        })
      })

    return cachedResponse
  }

  return Object.assign(cachedGot, got)
}
