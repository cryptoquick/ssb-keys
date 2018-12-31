import test from 'ava'
import * as ssbkeys from '../src'
import * as fs from 'fs'

const path = '/tmp/ssb-keys_' + Date.now()

test('create and load presigil-legacy async', t => {
  const keys = ssbkeys.generate('ed25519')
  keys.id = keys.id.substring(1)
  fs.writeFileSync(path, JSON.stringify(keys))

  const k2 = ssbkeys.loadSync(path)
  t.is(k2.id, '@' + keys.id)
})

test.cb('create and load presigil-legacy', t => {
  const keys = ssbkeys.generate('ed25519')
  keys.id = keys.id.substring(1)
  fs.writeFileSync(path, JSON.stringify(keys))

  ssbkeys.load(path, (err, k2) => {
    if (err) throw err
    t.is(k2.id, '@' + keys.id)
    t.end()
  })
})

test.cb('prevent clobbering existing keys', t => {
  fs.writeFileSync(path, 'this file intentionally left blank', 'ascii')
  t.throws(() => {
    ssbkeys.createSync(path)
  })
  ssbkeys.create(path, err => {
    t.truthy(err) // this should be truthy because an error should be passed
    fs.unlinkSync(path)
    t.end()
  })
})
