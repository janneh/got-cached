got-cached
=====================

Got cached is a provider of a cache wrapper around `got` (for http GET requests).

note: cache hits only include `response.status` (200) and `response.body`

## Install

```
$ npm install --save got-cached
```

## Usage

`gotChached` takes options that should include a cache object
that is expected to to have the functions `set(key, value)` and `get(key)`
(returning a Promise that resolves the value).

```
import fs from 'fs'
import { createClient } from 'then-redis'
import gotCached from 'got-cached'

const expiry = 600
const redis = createClient()
const options = {
  cache: {
    get: (key) => redis.get(key),
    set: (key, value) => redis.send('set', [key, value, 'EX', expiry])
  }
}

const got = gotCached(options)

got('http://httpbin.org/get').then((response) => {
  console.log(response.body)
})

// Streams are not cached, but still play nicely
got.stream('todomvc.com').pipe(fs.createWriteStream('index.html'))
```
