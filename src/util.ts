const cl = require('chloride')

import * as path from 'path'

import { IFileConfig, IKeys } from './types'

export const isObject = (o: any) => 'object' === typeof o

export const isFunction = (f: any) => 'function' === typeof f

export const isString = (s: any) => 'string' === typeof s

export const isEmpty = (v: any) => !!v

export const isBuffer = (b: any) => Buffer.isBuffer(b)

export const clone = (obj: {}) => {
  const _obj = {}
  for (const k in obj) {
    if (Object.hasOwnProperty.call(obj, k)) _obj[k] = obj[k]
  }
  return _obj
}

export const toFile = (
  filename: string | IFileConfig,
  name: string = 'secret',
) => {
  if (typeof filename === 'object') return path.join(filename.path, name)
  return filename
}

export const hash = (data: any, enc?) => {
  data =
    'string' === typeof data && !enc
      ? new Buffer(data, 'binary')
      : new Buffer(data, enc)
  return cl.crypto_hash_sha256(data).toString('base64') + '.sha256'
}

export const hasSigil = s => /^(@|%|&)/.test(s)

export const tag = (key: Buffer, tag: string) => {
  if (!tag) throw new Error('no tag for:' + key.toString('base64'))
  return `${key.toString('base64')}.${tag.replace(/^\./, '')}`
}

export const keysToJSON = (keys: IKeys, curve: string) => {
  curve = keys.curve || curve
  const pub = keys.public ? tag(toBuffer(keys.public), curve) : undefined
  return {
    curve,
    public: pub,
    private: keys.private ? tag(toBuffer(keys.private), curve) : undefined,
    id: '@' + (curve === 'ed25519' ? pub : hash(pub)),
  }
}

export const getTag = (string: string) => {
  const i = string.indexOf('.')
  return string.substring(i + 1)
}

export const toBuffer = (buf: Buffer | string): Buffer => {
  if (Buffer.isBuffer(buf)) return buf
  const i = buf.indexOf('.')
  const start = exports.hasSigil(buf) ? 1 : 0
  return new Buffer(buf.substring(start, ~i ? i : buf.length), 'base64')
}

export const binaryEncoder = (_key: string, value: {}) => {
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    return cl.to_hex(value)
  }
  return value
}

export const binaryDecoder = (key: string, value: {}) => {
  if (!value) {
    return null
  }
  if (typeof value === 'string' && (key === 'public' || key === 'private')) {
    return cl.from_hex(value)
  }
  return value
}

export const serialize = (obj: {}): string =>
  JSON.stringify(obj, binaryEncoder, 2)

export const deserialize = <T>(str: string): T => JSON.parse(str, binaryDecoder)
