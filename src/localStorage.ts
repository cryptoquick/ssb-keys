import { generate } from './sodium'
import { NodeCallback, IKeys } from './types'

export const createSync = filename => {
  const keys = generate()
  localStorage[filename] = JSON.stringify(keys)
  return keys
}

export const loadSync = filename => JSON.parse(localStorage[filename])

export const create = (filename: string, cb: NodeCallback<IKeys>) => {
  cb(null, createSync(filename))
}

export const load = (filename, cb: any) => {
  cb(null, loadSync(filename))
}
