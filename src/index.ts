const sodium = require('chloride')

const pb = require('private-box')

import {
  hash,
  clone,
  getTag,
  isObject,
  isBuffer,
  keysToJSON,
  toBuffer,
} from './util'

import * as ed25519 from './sodium'

import { load, create, loadSync, createSync } from './storage'
import { ISignedObj, IKeys } from './types'

const hmac = sodium.crypto_auth

const curves = {
  ed25519,
}

export const getCurve = (keys?: IKeys) => 'ed25519'

//this should return a key pair:
// {curve: curve, public: Buffer, private: Buffer}

export const generate = (curve: string = 'ed25519', seed?: Buffer) => {
  if (!curves[curve]) throw new Error('unknown curve:' + curve)

  return keysToJSON(curves[curve].generate(seed), curve)
}

//import functions for loading/saving keys from storage
export const loadOrCreate = (filename, cb) => {
  load(filename, (err, keys) => {
    if (!err) return cb(null, keys)
    create(filename, cb)
  })
}

export const loadOrCreateSync = (filename: string) => {
  try {
    return loadSync(filename)
  } catch (err) {
    return createSync(filename)
  }
}

//takes a public key and a hash and returns a signature. <- Is this supposed to say private key?
//(a signature must be a node buffer)
const sign = (key: string, msg: Buffer | string) => {
  if (typeof msg === 'string') msg = new Buffer(msg)
  if (!isBuffer(msg)) throw new Error('msg should be buffer')

  const curve = getCurve()

  return (
    curves[curve].sign(toBuffer(key), msg).toString('base64') + '.sig.' + curve
  )
}

//takes a public key, signature, and a hash
//and returns true if the signature was valid.
const verify = (keys: IKeys, sig: string, msg: Buffer) => {
  if (isObject(sig))
    throw new Error(
      'signature should be base64 string, did you mean verifyObj(public, signed_obj)',
    )
  if (!keys.public) throw new Error('no public key provided')

  return curves.ed25519.verify(
    toBuffer(keys.public),
    toBuffer(sig),
    isBuffer(msg) ? msg : new Buffer(msg),
  )
}

// OTHER CRYTPO FUNCTIONS

export const signObj = (keys: string, obj: {}, hmac_key?: string | Buffer) => {
  const _obj = clone(obj) as ISignedObj
  let b = new Buffer(JSON.stringify(_obj, null, 2))
  if (hmac_key) b = hmac(b, toBuffer(hmac_key))
  _obj.signature = sign(keys, b)
  return _obj
}

export const verifyObj = (
  keys: IKeys,
  obj: ISignedObj,
  hmac_key?: string | Buffer,
) => {
  const _obj = clone(obj) as ISignedObj
  const sig = _obj.signature
  delete _obj.signature
  let b = new Buffer(JSON.stringify(_obj, null, 2))
  if (hmac_key) b = hmac(b, toBuffer(hmac_key))
  return verify(keys, sig, b)
}

export const box = (msg, recipients) => {
  msg = new Buffer(JSON.stringify(msg))

  recipients = recipients.map(function(keys) {
    return sodium.crypto_sign_ed25519_pk_to_curve25519(
      toBuffer(keys.public || keys),
    )
  })

  return pb.multibox(msg, recipients).toString('base64') + '.box'
}

export const unboxKey = (boxed, keys) => {
  boxed = toBuffer(boxed)
  const sk = sodium.crypto_sign_ed25519_sk_to_curve25519(
    toBuffer(keys.private || keys),
  )
  return pb.multibox_open_key(boxed, sk)
}

export const unboxBody = (boxed, key) => {
  if (!key) return null
  boxed = toBuffer(boxed)
  key = toBuffer(key)
  const msg = pb.multibox_open_body(boxed, key)
  try {
    return JSON.parse('' + msg)
  } catch (_) {}
}

export const unbox = (boxed, keys) => {
  boxed = toBuffer(boxed)

  try {
    const sk = sodium.crypto_sign_ed25519_sk_to_curve25519(
      toBuffer(keys.private || keys),
    )
    const msg = pb.multibox_open(boxed, sk)
    return JSON.parse('' + msg)
  } catch (_) {}
  return
}

export { hash, getTag, createSync, loadSync, create, load }
