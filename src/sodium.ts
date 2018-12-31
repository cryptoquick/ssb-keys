const sodium = require('chloride')

import { IKeys } from './types'

export const curves = ['ed25519']

export const generate = (seed?: Buffer): IKeys => {
  if (!seed) sodium.randombytes((seed = new Buffer(32)))

  const keys = seed
    ? sodium.crypto_sign_seed_keypair(seed)
    : sodium.crypto_sign_keypair()

  return {
    id: `@${keys.publicKey.toString('hex')}`,
    curve: 'ed25519',
    public: keys.publicKey,

    //so that this works with either sodium
    //or libsodium-wrappers (in browser)
    private: keys.privateKey || keys.secretKey,
  }
}

export const sign = (privateKey: Buffer, message: Buffer) =>
  sodium.crypto_sign_detached(message, privateKey)

export const verify = (publicKey: Buffer, sig: Buffer, message: Buffer) =>
  sodium.crypto_sign_verify_detached(sig, message, publicKey)
