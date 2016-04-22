import fs from 'fs'
import { createClient } from 'then-redis'
import gotCached from '../'

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
  console.log(response.body) // eslint-disable-line
})

setTimeout(() => {
  got('http://httpbin.org/get').then(function(response) {
    console.log(response.body) // eslint-disable-line
  })
}, 1000)

// Streams are not cached, but still play nicely
got.stream('todomvc.com').pipe(fs.createWriteStream('index.html'))
