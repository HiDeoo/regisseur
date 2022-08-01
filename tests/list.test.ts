import { describe, expect, test } from 'vitest'

import { PLAYS_DIRECTORY } from '../src/constants/play'
import { findAllPlays } from '../src/libs/play'

import { withFixture } from './utils'

describe('findAllPlays', () => {
  test('should error with no plays directory', async () =>
    withFixture('no-plays-directory', async () => {
      await expect(findAllPlays).rejects.toThrowError(
        `Could not locate '${PLAYS_DIRECTORY}' directory. It should be at the root of your project.`
      )
    }))

  test('should list no plays', async () =>
    withFixture('no-plays', async () => {
      const { all } = await findAllPlays()

      expect(all).toEqual([])
    }))

  test('should list a single play', async () =>
    withFixture('single-play-default', async () => {
      const { all } = await findAllPlays()

      expect(all).toHaveLength(1)
      expect(all[0]).toMatchPlay({ fileName: 'default' })
    }))

  test('should list multiple plays', async () =>
    withFixture('multiple-plays-default', async () => {
      const { all } = await findAllPlays()

      expect(all).toHaveLength(3)
      expect(all[0]).toMatchPlay({ fileName: 'default', name: 'Default Name' })
      expect(all[1]).toMatchPlay({ fileName: 'test1' })
      expect(all[2]).toMatchPlay({ fileName: 'test2', name: 'Test 2 Name' })
    }))

  test('should identify the default single play', async () =>
    withFixture('single-play-default', async () => {
      const { def } = await findAllPlays()

      expect(def).toBeDefined()
      expect(def).toMatchPlay({ fileName: 'default' })
    }))

  test('should mark a single play as default', async () =>
    withFixture('single-play-no-default', async () => {
      const { def } = await findAllPlays()

      expect(def).toBeDefined()
      expect(def).toMatchPlay({ fileName: 'test' })
    }))

  test('should identify the default with multiple plays', async () =>
    withFixture('multiple-plays-default', async () => {
      const { def } = await findAllPlays()

      expect(def).toBeDefined()
      expect(def).toMatchPlay({ fileName: 'default' })
    }))

  test('should not identify a default with multiple plays and no explicit default', async () =>
    withFixture('multiple-plays-no-default', async () => {
      const { def } = await findAllPlays()

      expect(def).not.toBeDefined()
    }))
})
