import got from 'got'

/*
* Returns `got` wrapped with cache to be used as normal got
*/

export default function gotCached(options) {
  if (!options.cache) throw Error('cache is a required option')
  const { cache } = options

  function setCache(key, response) {
    const promise = response.then(response => {
      cache.set(key, response.body)

      return Promise.resolve(response)
    })

    return promise
  }

  function getCache(key) {
    const promise = cache.get(key).then(value => {
      if (!value) return null

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

    const cachedResponse = getCache(url)
      .then((cached) => {
        // return the cached result if it exist
        if(cached) return cached

        // return got response but first set cache with it
        return setCache(url, got(url, options))
      })

    return cachedResponse
  }

  for(const prop in got) {
    cachedGot[prop] = got[prop]
  }

  return cachedGot
}
