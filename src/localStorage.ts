import { generate } from './sodium'
import { NodeCallback, IBufferKeys } from './types'
import { serialize } from './util'

export const createSync = filename => {
  const keys = generate()
  localStorage[filename] = serialize(keys)
  return keys
}

export const loadSync = filename => JSON.parse(localStorage[filename])

export const create = (filename: string, cb: NodeCallback<IBufferKeys>) => {
  cb(null, createSync(filename))
}

export const load = (filename, cb: any) => {
  cb(null, loadSync(filename))
}
