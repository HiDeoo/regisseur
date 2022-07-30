import { describe, expect, test } from 'vitest'

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

  test('should return the default act matching a path', async () =>
    withFixture('multiple-acts-default', async () => {
      const act = await findAct(`./fixtures/multiple-acts-default/acts/test1.${ACT_EXTENSION}`)

      expect(act).toMatchAct({ fileName: 'test1' })
    }))

  test('should return the default act matching a file name with no extension', async () =>
    withFixture('multiple-acts-default', async () => {
      const act = await findAct('test1')

      expect(act).toMatchAct({ fileName: 'test1' })
    }))

  test('should return the default act matching a file name with the extension', async () =>
    withFixture('multiple-acts-default', async () => {
      const act = await findAct('test1.act')

      expect(act).toMatchAct({ fileName: 'test1' })
    }))

  test.todo('should return the default act matching a name')

  test('should error with with an argument not matching a path, file name or name', async () =>
    withFixture('multiple-acts-no-default', async () => {
      await expect(findAct('non-existent')).rejects.toThrowErrorMatchingInlineSnapshot(
        '"Could not find an act matching the given path, file name or name."'
      )
    }))
})
