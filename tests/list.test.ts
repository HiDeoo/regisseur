import { expect, test } from 'vitest'

import { listAction } from '../src/actions'
import { PLAYS_DIRECTORY } from '../src/constants/play'
import { findAllPlays } from '../src/libs/play'

import { withFixture } from './utils'

test('should error with no plays directory', async () =>
  withFixture('no-plays-directory', async () => {
    await expect(listAction).rejects.toThrowError(
      `Could not locate '${PLAYS_DIRECTORY}' directory. It should be at the root of your project.`
    )
  }))

test('should list no plays', async () =>
  withFixture('no-plays', async ({ log }) => {
    await listAction()

    expect(log).toHaveBeenCalledOnce()
    expect(log).toHaveBeenNthCalledWith(1, `No plays found in the '${PLAYS_DIRECTORY}' directory.`)
  }))

test('should list a single play', async () =>
  withFixture('single-play-default', async ({ log }) => {
    await listAction()

    expect(log).toHaveBeenCalledTimes(2)
    expect(log).toHaveBeenNthCalledWith(1, getCountOutput(1))
    expect(log).toHaveBeenNthCalledWith(2, getPlayOutput('default', true))
  }))

test('should list multiple plays and identify the default one', async () =>
  withFixture('multiple-plays-default', async ({ log }) => {
    await listAction()

    expect(log).toHaveBeenCalledTimes(4)
    expect(log).toHaveBeenNthCalledWith(1, getCountOutput(3))
    expect(log).toHaveBeenNthCalledWith(2, getPlayOutput('default', true, 'Default Name'))
    expect(log).toHaveBeenNthCalledWith(3, getPlayOutput('test1'))
    expect(log).toHaveBeenNthCalledWith(4, getPlayOutput('test2', false, 'Test 2 Name'))
  }))

test('should identify the default single play', async () =>
  withFixture('single-play-default', async ({ log }) => {
    await listAction()

    expect(log).toHaveBeenCalledTimes(2)
    expect(log).toHaveBeenNthCalledWith(1, getCountOutput(1))
    expect(log).toHaveBeenNthCalledWith(2, getPlayOutput('default', true))
  }))

test('should mark a single play as default', async () =>
  withFixture('single-play-no-default', async ({ log }) => {
    await listAction()

    expect(log).toHaveBeenCalledTimes(2)
    expect(log).toHaveBeenNthCalledWith(1, getCountOutput(1))
    expect(log).toHaveBeenNthCalledWith(2, getPlayOutput('test', true))
  }))

test('should not identify a default with multiple plays and no explicit default', async () =>
  withFixture('multiple-plays-no-default', async ({ log }) => {
    await listAction()

    expect(log).toHaveBeenCalledTimes(7)
    expect(log).toHaveBeenNthCalledWith(1, getCountOutput(6))
    expect(log).toHaveBeenNthCalledWith(2, getPlayOutput('act-with-no-scenes', false))
    expect(log).toHaveBeenNthCalledWith(3, getPlayOutput('act-with-no-title', false))
    expect(log).toHaveBeenNthCalledWith(4, getPlayOutput('multiple-acts', false, 'Multiple Acts'))
    expect(log).toHaveBeenNthCalledWith(5, getPlayOutput('no-acts-property', false))
    expect(log).toHaveBeenNthCalledWith(6, getPlayOutput('no-acts', false))
    expect(log).toHaveBeenNthCalledWith(7, getPlayOutput('single-act', false, 'multiple-acts'))

    const { def } = await findAllPlays()

    expect(def).not.toBeDefined()
  }))

function getCountOutput(count: number) {
  return `Found ${count} play${count === 1 ? '' : 's'}:`
}

function getPlayOutput(fileName: string, isDefault = false, name?: string) {
  return `  ${isDefault ? '*' : '-'} ${fileName}.play${name ? ` (name: ${name})` : ''}`
}
