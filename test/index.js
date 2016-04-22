import test from 'tape'
import nock from 'nock'
import sinon from 'sinon'
import gotCached from '../'

const URL = 'http://foo.com'
const MOCK_HOST = 'http://bar.com'
const MOCK_PATH = '/bar'
const CACHE_DATA = { cached: 'cached' }
const MOCK_DATA = { mock: 'mock' }

test('returns a function called with new', function (t) {
  t.plan(1)
  t.is(typeof new gotCached({ got: true, cache: true }), 'function')
})

test('returns a function called without new', function (t) {
  t.plan(1)
  t.is(typeof gotCached({ got: true, cache: true }), 'function')
})

test('call without options.cache throws', function (t) {
  t.plan(1)
  t.throws(() => gotCached({ got: true }))
})

test('call with options.cache does not throws', function (t) {
  t.plan(1)
  t.doesNotThrow(() => gotCached({ cache: true }))
})

test('got returns cached data if cache exists', function (t) {
  t.plan(1)

  const cacheStub = {
    get: sinon.stub().returns(Promise.resolve(CACHE_DATA)),
    set: sinon.stub()
  }
  const got = gotCached({ cache: cacheStub })

  got(URL).then(response => { t.deepEqual(response.body, CACHE_DATA) })
})

test('got returns response data if no cache exists', function (t) {
  t.plan(1)

  const scope = nock(MOCK_HOST) // eslint-disable-line no-unused-vars
    .get(MOCK_PATH)
    .reply(200, MOCK_DATA)

  const cacheStub = {
    get: sinon.stub().withArgs(URL).returns(Promise.resolve(null)),
    set: function() {}
  }

  const got = gotCached({ cache: cacheStub })

  got(`${MOCK_HOST}${MOCK_PATH}`).then((response) =>  {
    t.deepEqual(JSON.parse(response.body), MOCK_DATA)
  })
})

test('got.stream is a function', function(t) {
  t.plan(1)

  const got = gotCached({ cache: {} })

  t.is(typeof got.stream, 'function')
})
