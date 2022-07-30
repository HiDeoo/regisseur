import { describe, expect, test } from 'vitest'

import { ACTS_DIRECTORY } from '../src/constants/act'
import { findAllActs } from '../src/libs/act'

import { withFixture } from './utils'

describe('findAllActs', () => {
  test('should error with no acts directory', async () =>
    withFixture('no-acts-directory', async () => {
      await expect(findAllActs).rejects.toThrowError(
        `Could not locate '${ACTS_DIRECTORY}' directory. It should be at the root of your project.`
      )
    }))

  test('should list no acts', async () =>
    withFixture('no-acts', async () => {
      const { all } = await findAllActs()

      expect(all).toEqual([])
    }))

  test('should list a single act', async () =>
    withFixture('single-act-default', async () => {
      const { all } = await findAllActs()

      expect(all).toHaveLength(1)
      expect(all[0]).toMatchAct({ fileName: 'default' })
    }))

  test('should list multiple acts', async () =>
    withFixture('multiple-acts-default', async () => {
      const { all } = await findAllActs()

      expect(all).toHaveLength(3)
      expect(all[0]).toMatchAct({ fileName: 'default' })
      expect(all[1]).toMatchAct({ fileName: 'test1' })
      expect(all[2]).toMatchAct({ fileName: 'test2' })
    }))

  test('should identify the default single act', async () =>
    withFixture('single-act-default', async () => {
      const { def } = await findAllActs()

      expect(def).toBeDefined()
      expect(def).toMatchAct({ fileName: 'default' })
    }))

  test('should mark a single act as default', async () =>
    withFixture('single-act-no-default', async () => {
      const { def } = await findAllActs()

      expect(def).toBeDefined()
      expect(def).toMatchAct({ fileName: 'test' })
    }))

  test('should identify the default with multiple acts', async () =>
    withFixture('multiple-acts-default', async () => {
      const { def } = await findAllActs()

      expect(def).toBeDefined()
      expect(def).toMatchAct({ fileName: 'default' })
    }))

  test('should not identify a default with multiple acts and no explicit default', async () =>
    withFixture('multiple-acts-no-default', async () => {
      const { def } = await findAllActs()

      expect(def).not.toBeDefined()
    }))
})
