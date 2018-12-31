import test from 'ava'
import * as ssbkeys from '../src'
import * as crypto from 'crypto'
const path = '/tmp/ssb-keys_' + Date.now()

// console.log = () => {}

test.cb('create and load async', t => {
  console.log(ssbkeys)
  ssbkeys.create(path, (err, k1) => {
    if (err || !k1 || !k1.id) throw err
    ssbkeys.load(path, (err, k2) => {
      if (err || !k2.id) throw err
      if (!k1.private || !k2.private) throw err
      console.log(k1, k2)
      t.is(k1.id, k2.id)
      t.is(k1.private.toString('hex'), k2.private.toString('hex'))
      t.is(k1.public.toString('hex'), k2.public.toString('hex'))
      t.end()
    })
  })
})

test('create and load sync', t => {
  const k1 = ssbkeys.createSync(path + '1')
  const k2 = ssbkeys.loadSync(path + '1')
  if (!k1.private || !k2.private) throw Error()

  t.is(k1.id, k2.id)
  t.is(k1.private.toString('hex'), k2.private.toString('hex'))
  t.is(k1.public.toString('hex'), k2.public.toString('hex'))
})

test('sign and verify a javascript object', t => {
  const obj = require('../package.json')

  console.log(obj)

  const keys = ssbkeys.generate()
  const sig = ssbkeys.signObj(keys.private, obj)
  console.log(sig)
  t.truthy(sig)
  t.truthy(ssbkeys.verifyObj(keys, sig))
  t.truthy(ssbkeys.verifyObj({ public: keys.public }, sig))
})

//allow sign and verify to also take a separate key
//so that we can create signatures that cannot be used in other places.
//(i.e. testnet) avoiding chosen protocol attacks.
test('sign and verify a hmaced object javascript object in buffer format', t => {
  const obj = require('../package.json')
  const hmac_key = crypto.randomBytes(32)
  const hmac_key2 = crypto.randomBytes(32)

  const keys = ssbkeys.generate()
  const sig = ssbkeys.signObj(keys.private, obj, hmac_key)
  console.log(sig)
  t.truthy(sig)
  //verify must be passed the key to correctly verify
  t.falsy(ssbkeys.verifyObj(keys, sig))
  t.falsy(ssbkeys.verifyObj({ public: keys.public }, sig))
  t.truthy(ssbkeys.verifyObj(keys, sig, hmac_key))
  t.truthy(ssbkeys.verifyObj({ public: keys.public }, sig, hmac_key))
  //a different hmac_key fails to verify
  t.falsy(ssbkeys.verifyObj(keys, sig, hmac_key2))
  t.falsy(ssbkeys.verifyObj({ public: keys.public }, sig, hmac_key2))
})

test('sign and verify a hmaced object javascript object in base64 format', t => {
  //assert that hmac_key may also be passed as base64
  const obj = require('../package.json')
  const hmac_key = crypto.randomBytes(32).toString('base64')
  const hmac_key2 = crypto.randomBytes(32).toString('base64')

  const keys = ssbkeys.generate()
  const sig = ssbkeys.signObj(keys.private, obj, hmac_key)
  console.log(sig)
  t.truthy(sig)
  //verify must be passed the key to correctly verify
  t.falsy(ssbkeys.verifyObj(keys, sig))
  t.falsy(ssbkeys.verifyObj({ public: keys.public }, sig))
  t.truthy(ssbkeys.verifyObj(keys, sig, hmac_key))
  t.truthy(ssbkeys.verifyObj({ public: keys.public }, sig, hmac_key))
  //a different hmac_key fails to verify
  t.falsy(ssbkeys.verifyObj(keys, sig, hmac_key2))
  t.falsy(ssbkeys.verifyObj({ public: keys.public }, sig, hmac_key2))
})

test('seeded keys, ed25519', t => {
  const seed = crypto.randomBytes(32)
  const k1 = ssbkeys.generate('ed25519', seed)
  const k2 = ssbkeys.generate('ed25519', seed)

  t.deepEqual(k1, k2)
})

test('ed25519 id === "@" ++ pubkey', t => {
  const keys = ssbkeys.generate('ed25519')
  t.is(keys.id, '@' + keys.public)
})
