import { expect, test } from 'vitest'

import { validateAction } from '../src/actions'

import { withFixture } from './utils'

test('should error with an invalid name', async () =>
  withFixture('invalid-name', async () => {
    expect.assertions(1)

    try {
      await validateAction(undefined)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  }))

test('should validate a valid play', async () =>
  withFixture('single-play-default', async ({ log }) => {
    await validateAction(undefined)

    expect(log).toHaveBeenCalledOnce()
    expect(log).toHaveBeenCalledWith("The play 'default.play' is valid.")
  }))
