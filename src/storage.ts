import * as fs from 'fs'

import * as fileSystem from './fileSystem'

import * as localStorage from './localStorage'

const notFS = !fs || !fs.readFile

export const createSync = notFS
  ? localStorage.createSync
  : fileSystem.createSync
export const loadSync = notFS ? localStorage.loadSync : fileSystem.loadSync
export const create = notFS ? localStorage.create : fileSystem.create
export const load = notFS ? localStorage.load : fileSystem.load
