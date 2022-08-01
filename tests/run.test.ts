import { describe, expect, test } from 'vitest'
import { ZodError } from 'zod'

import { PLAYS_DIRECTORY, PLAY_EXTENSION } from '../src/constants/play'
import { findPlay } from '../src/libs/play'

import { withFixture } from './utils'

describe('findPlay', () => {
  test('should error with no argument and no default', async () =>
    withFixture('multiple-plays-no-default', async () => {
      await expect(findPlay(undefined)).rejects.toThrowError(
        `No default play found in the '${PLAYS_DIRECTORY}' directory. It should be a 'default.${PLAY_EXTENSION}' file.`
      )
    }))

  test('should return the default play with no argument', async () =>
    withFixture('single-play-default', async () => {
      const play = await findPlay(undefined)

      expect(play).toMatchPlay({ fileName: 'default' })
    }))

  test('should return the play matching a path', async () =>
    withFixture('multiple-plays-default', async () => {
      const play = await findPlay(`./fixtures/multiple-plays-default/plays/test1.${PLAY_EXTENSION}`)

      expect(play).toMatchPlay({ fileName: 'test1' })
    }))

  test('should return the play matching a file name with no extension', async () =>
    withFixture('multiple-plays-default', async () => {
      const play = await findPlay('test1')

      expect(play).toMatchPlay({ fileName: 'test1' })
    }))

  test('should return the play matching a file name with the extension', async () =>
    withFixture('multiple-plays-default', async () => {
      const play = await findPlay('test1.play')

      expect(play).toMatchPlay({ fileName: 'test1' })
    }))

  test('should return the play matching a file name over a name', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const fileName = 'test2'

      let play = await findPlay('test3')

      expect(play).toMatchPlay({ fileName: 'test3', name: fileName })

      play = await findPlay(fileName)

      expect(play).toMatchPlay({ fileName: fileName, name: 'Test 2' })
    }))

  test('should return the play matching a name', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const play = await findPlay('Test 2')

      expect(play).toMatchPlay({ fileName: 'test2', name: 'Test 2' })
    }))

  test('should error with an argument not matching a path, file name or name', async () =>
    withFixture('multiple-plays-no-default', async () => {
      await expect(findPlay('non-existent')).rejects.toThrowErrorMatchingInlineSnapshot(
        '"Could not find an play matching the given path, file name or name."'
      )
    }))

  test('should error with an unparseable play file', async () =>
    withFixture('invalid-unparseable', async () => {
      expect.assertions(3)

      try {
        await findPlay(undefined)
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toMatch(
            `Could not read the play file at '${PLAYS_DIRECTORY}/default.${PLAY_EXTENSION}'.`
          )

          if (error.cause) {
            expect(error.cause).toBeDefined()
            expect(error.cause).toMatch(/check your syntax/)
          }
        }
      }
    }))

  test('should error with an invalid name', async () =>
    withFixture('invalid-name', async () => {
      expect.assertions(3)

      try {
        await findPlay(undefined)
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toMatch(
            `Could not read the play file at '${PLAYS_DIRECTORY}/default.${PLAY_EXTENSION}'.`
          )

          if (error.cause) {
            expect(error.cause).toBeDefined()
            expect(error.cause).toBeInstanceOf(ZodError)
          }
        }
      }
    }))
})
