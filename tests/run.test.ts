import { describe, expect, test } from 'vitest'
import { ZodError } from 'zod'

import { PLAYS_DIRECTORY, PLAY_EXTENSION } from '../src/constants/play'
import { getActs } from '../src/libs/act'
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
      const fileName = 'multiple-acts'

      let play = await findPlay('no-acts')

      expect(play).toMatchPlay({ fileName: 'no-acts', name: fileName })

      play = await findPlay(fileName)

      expect(play).toMatchPlay({ fileName: fileName, name: 'Multiple Acts' })
    }))

  test('should return the play matching a name', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const name = 'Multiple Acts'

      const play = await findPlay(name)

      expect(play).toMatchPlay({ fileName: 'multiple-acts', name })
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

describe('getActs', () => {
  const getActsReadErrorRegExp = /^Could not read acts from the play file at '/

  test('should error if the acts property is missing', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const play = await findPlay('no-acts-property')

      expect(() => getActs(play)).toThrowError(getActsReadErrorRegExp)
    }))

  test('should return no acts', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const play = await findPlay('no-acts')
      const acts = getActs(play)

      expect(acts).toHaveLength(0)
    }))

  test('should return a single act', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const play = await findPlay('single-act')
      const acts = getActs(play)

      expect(acts).toHaveLength(1)
    }))

  test('should return multiple acts', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const play = await findPlay('multiple-acts')
      const acts = getActs(play)

      expect(acts).toHaveLength(3)
    }))

  test('should error if an act does not have a title', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const play = await findPlay('act-with-no-title')

      expect(() => getActs(play)).toThrowError(getActsReadErrorRegExp)
    }))

  test('should error if an act does not have a scenes property', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const play = await findPlay('act-with-no-scenes')

      expect(() => getActs(play)).toThrowError(getActsReadErrorRegExp)
    }))
})
