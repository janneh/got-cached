import test from 'tape'
import nock from 'nock'
import sinon from 'sinon'
import gotCached from '../'

const URL = 'http://foo.com'
const MOCK_HOST = 'http://bar.com'
const MOCK_PATH = '/bar'
const MOCK_DATA = { mock: 'mock' }
const CACHED_TEXT = 'cached'
const CACHED_JSON = { cached: 'cached' }

test('returns a function called with new', function (t) {
  t.plan(1)
  t.is(typeof new gotCached({ cache: {} }), 'function')
})

test('returns a function called without new', function (t) {
  t.plan(1)
  t.is(typeof gotCached({ cache: {} }), 'function')
})

test('call without options.cache throws', function (t) {
  t.plan(1)
  t.throws(() => gotCached())
})

test('call with options.cache does not throws', function (t) {
  t.plan(1)
  t.doesNotThrow(() => gotCached({ cache: {} }))
})

test('returns response data if no cache exists', function (t) {
  t.plan(1)

  const scope = nock(MOCK_HOST) // eslint-disable-line no-unused-vars
    .get(MOCK_PATH)
    .reply(200, MOCK_DATA)

  const cacheStub = {
    get: sinon.stub().withArgs(URL).returns(Promise.resolve(null)),
    set: function() {}
  }

  const got = gotCached({ cache: cacheStub })

  got(`${MOCK_HOST}${MOCK_PATH}`, { json: true })
    .then((response) =>  {
      t.deepEqual(response.body, MOCK_DATA)
    })
})

test('returns cached text data if cached', function (t) {
  t.plan(1)

  const cacheStub = {
    get: sinon.stub().returns(Promise.resolve(CACHED_TEXT)),
    set: sinon.stub()
  }
  const got = gotCached({ cache: cacheStub })

  got(URL)
    .then(response => {
      t.deepEqual(response.body, CACHED_TEXT)
    })
})

test('returns cached json data if cached and options.json', function (t) {
  t.plan(1)

  const cacheStub = {
    get: sinon.stub().returns(Promise.resolve(JSON.stringify(CACHED_JSON))),
    set: sinon.stub()
  }
  const got = gotCached({ cache: cacheStub })

  got(URL, { json: true })
    .then(response => {
      t.deepEqual(response.body, CACHED_JSON)
    })
})

test('.stream is a function', function(t) {
  t.plan(1)

  const got = gotCached({ cache: {} })

  t.is(typeof got.stream, 'function')
})
