import { describe, expect, test } from 'vitest'
import { ZodError } from 'zod'

import { ACTS_DIRECTORY, ACT_EXTENSION } from '../src/constants/act'
import { findAct } from '../src/libs/act'

import { withFixture } from './utils'

describe('findAct', () => {
  test('should error with no argument and no default', async () =>
    withFixture('multiple-acts-no-default', async () => {
      await expect(findAct(undefined)).rejects.toThrowError(
        `No default act found in the '${ACTS_DIRECTORY}' directory. It should be a 'default.${ACT_EXTENSION}' file.`
      )
    }))

  test('should return the default act with no argument', async () =>
    withFixture('single-act-default', async () => {
      const act = await findAct(undefined)

      expect(act).toMatchAct({ fileName: 'default' })
    }))

  test('should return the act matching a path', async () =>
    withFixture('multiple-acts-default', async () => {
      const act = await findAct(`./fixtures/multiple-acts-default/acts/test1.${ACT_EXTENSION}`)

      expect(act).toMatchAct({ fileName: 'test1' })
    }))

  test('should return the act matching a file name with no extension', async () =>
    withFixture('multiple-acts-default', async () => {
      const act = await findAct('test1')

      expect(act).toMatchAct({ fileName: 'test1' })
    }))

  test('should return the act matching a file name with the extension', async () =>
    withFixture('multiple-acts-default', async () => {
      const act = await findAct('test1.act')

      expect(act).toMatchAct({ fileName: 'test1' })
    }))

  test('should return the act matching a file name over a name', async () =>
    withFixture('multiple-acts-no-default', async () => {
      const fileName = 'test2'

      let act = await findAct('test3')

      expect(act).toMatchAct({ fileName: 'test3', name: fileName })

      act = await findAct(fileName)

      expect(act).toMatchAct({ fileName: fileName, name: 'Test 2' })
    }))

  test('should return the act matching a name', async () =>
    withFixture('multiple-acts-no-default', async () => {
      const act = await findAct('Test 2')

      expect(act).toMatchAct({ fileName: 'test2', name: 'Test 2' })
    }))

  test('should error with an argument not matching a path, file name or name', async () =>
    withFixture('multiple-acts-no-default', async () => {
      await expect(findAct('non-existent')).rejects.toThrowErrorMatchingInlineSnapshot(
        '"Could not find an act matching the given path, file name or name."'
      )
    }))

  test('should error with an unparseable act file', async () =>
    withFixture('invalid-unparseable', async () => {
      expect.assertions(3)

      try {
        await findAct(undefined)
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toMatch(`Could not read the act file at '${ACTS_DIRECTORY}/default.${ACT_EXTENSION}'.`)

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
        await findAct(undefined)
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toMatch(`Could not read the act file at '${ACTS_DIRECTORY}/default.${ACT_EXTENSION}'.`)

          if (error.cause) {
            expect(error.cause).toBeDefined()
            expect(error.cause).toBeInstanceOf(ZodError)
          }
        }
      }
    }))
})
