import test from 'ava'
import * as ssbkeys from '../src'

test('box, unbox', t => {
  const alice = ssbkeys.generate()
  const bob = ssbkeys.generate()

  const boxed = ssbkeys.box({ okay: true }, [bob.public, alice.public])
  console.log('boxed')
  const msg = ssbkeys.unbox(boxed, alice.private)
  t.deepEqual(msg, { okay: true })
})

test('return undefined for invalid content', t => {
  const alice = ssbkeys.generate()
  // const bob = ssbkeys.generate()

  const msg = ssbkeys.unbox('this is invalid content', alice.private)
  t.is(msg, undefined)
})
