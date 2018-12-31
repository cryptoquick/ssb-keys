import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'

import { isEmpty, hasSigil, toFile, deserialize } from './util'
import { generate } from './sodium'
import { NodeCallback, AnyObj, IBufferKeys } from './types'

//(DE)SERIALIZE KEYS

export const constructKeys = (keys: IBufferKeys): string => {
  if (!keys) throw new Error('*must* pass in keys')

  return [
    '# this is your SECRET name.',
    '# this name gives you magical powers.',
    '# with it you can mark your messages so that your friends can verify',
    '# that they really did come from you.',
    '#',
    '# if any one learns this name, they can use it to destroy your identity',
    '# NEVER show this to anyone!!!',
    '',
    JSON.stringify(keys, null, 2),
    '',
    "# WARNING! It's vital that you DO NOT edit OR share your secret name",
    '# instead, share your public name',
    '# your public name: ' + keys.id,
  ].join('\n')
}

export const reconstructKeys = (keyfile: string): IBufferKeys => {
  const privateKey = keyfile
    .replace(/\s*\#[^\n]*/g, '')
    .split('\n')
    .filter(isEmpty)
    .join('')

  //if the key is in JSON format, we are good.
  try {
    const keys = deserialize<IBufferKeys>(privateKey)
    if (!hasSigil(keys.id)) keys.id = '@' + keys.public
    return keys
  } catch (err) {
    console.error(err.stack)
    throw err.stack
  }
}

export const load = (filename: string, cb: NodeCallback<IBufferKeys>) => {
  filename = toFile(filename, 'secret')
  fs.readFile(filename, 'ascii', (err, privateKeyStr) => {
    if (err) return cb(err, AnyObj)
    let keys: IBufferKeys
    try {
      keys = reconstructKeys(privateKeyStr)
    } catch (err) {
      return cb(err, AnyObj)
    }
    cb(null, keys)
  })
}

export const loadSync = (filename: string): IBufferKeys => {
  filename = toFile(filename)
  return reconstructKeys(fs.readFileSync(filename, 'ascii'))
}

export const create = (filename: string, cb: NodeCallback<IBufferKeys>) => {
  filename = toFile(filename)
  const keys = generate()
  const keyfile = constructKeys(keys)
  mkdirp(path.dirname(filename), err => {
    if (err) return cb(err, AnyObj)
    fs.writeFile(filename, keyfile, { mode: 0x100, flag: 'wx' }, err => {
      if (err) return cb(err, AnyObj)
      cb(null, keys)
    })
  })
}

export const createSync = (filename: string) => {
  filename = toFile(filename)
  const keys = generate()
  const keyfile = constructKeys(keys)
  mkdirp.sync(path.dirname(filename))
  fs.writeFileSync(filename, keyfile, { mode: 0x100, flag: 'wx' })
  return keys
}
