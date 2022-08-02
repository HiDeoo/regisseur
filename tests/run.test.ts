import { expect, test } from 'vitest'
import { ZodError } from 'zod'

import { runAction } from '../src/actions'
import { PLAYS_DIRECTORY, PLAY_EXTENSION } from '../src/constants/play'
import { findPlay } from '../src/libs/play'

import { withFixture } from './utils'

const getActsReadErrorRegExp = /^Could not read acts from the play file at '/

test('should error with no argument and no default', async () =>
  withFixture('multiple-plays-no-default', async () => {
    await expect(runAction).rejects.toThrowError(
      `No default play found in the '${PLAYS_DIRECTORY}' directory. It should be a 'default.${PLAY_EXTENSION}' file.`
    )
  }))

test('should run the default play with no argument', async () =>
  withFixture('single-play-default', async ({ log }) => {
    await runAction(undefined)

    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput('default.play'))
  }))

test('should run the play matching a path', async () =>
  withFixture('multiple-plays-default', async ({ log }) => {
    const fileName = `test1.${PLAY_EXTENSION}`

    await runAction(`./fixtures/multiple-plays-default/plays/${fileName}`)

    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput(fileName))
  }))

test('should run the play with a name matching a path', async () =>
  withFixture('multiple-plays-default', async ({ log }) => {
    await runAction(`./fixtures/multiple-plays-default/plays/test2.${PLAY_EXTENSION}`)

    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput('Test 2 Name'))
  }))

test('should run the the play matching a file name with no extension', async () =>
  withFixture('multiple-plays-default', async ({ log }) => {
    const fileName = 'test1'

    await runAction(fileName)

    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput(`${fileName}.${PLAY_EXTENSION}`))
  }))

test('should run the play matching a file name over a name', async () =>
  withFixture('multiple-plays-no-default', async ({ log }) => {
    const fileName = 'single-act'
    const name = 'multiple-acts'

    await runAction(fileName)

    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput(name))

    // Let's make sure the play name match another play file name.
    const play = await findPlay(name)

    expect(play).toBeDefined()
  }))

test('should run the play matching a name', async () =>
  withFixture('multiple-plays-default', async ({ log }) => {
    const name = 'Test 2 Name'

    await runAction(name)

    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput(name))
  }))

test('should error with an argument not matching a path, file name or name', async () =>
  withFixture('multiple-plays-no-default', async () => {
    await expect(runAction('non-existent')).rejects.toThrowErrorMatchingInlineSnapshot(
      '"Could not find an play matching the given path, file name or name."'
    )
  }))

test('should error with an unparseable play file', async () =>
  withFixture('invalid-unparseable', async () => {
    expect.assertions(3)

    try {
      await runAction(undefined)
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toMatch(`Could not read the play file at '${PLAYS_DIRECTORY}/default.${PLAY_EXTENSION}'.`)

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
      await runAction(undefined)
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toMatch(`Could not read the play file at '${PLAYS_DIRECTORY}/default.${PLAY_EXTENSION}'.`)

        if (error.cause) {
          expect(error.cause).toBeDefined()
          expect(error.cause).toBeInstanceOf(ZodError)
        }
      }
    }
  }))

test('should not log the play file name or name if there are any validation error', async () =>
  withFixture('multiple-plays-no-default', async ({ log }) => {
    await expect(runAction('no-acts-property')).rejects.toThrowError()

    expect(log).not.toHaveBeenCalled()
  }))

test('should error if the play does not have any acts', async () =>
  withFixture('multiple-plays-no-default', async () => {
    await expect(runAction('no-acts-property')).rejects.toThrowError(getActsReadErrorRegExp)
  }))

test('should error if an act does not have a title', async () =>
  withFixture('multiple-plays-no-default', async () => {
    await expect(runAction('act-with-no-title')).rejects.toThrowError(getActsReadErrorRegExp)
  }))

test('should error if an act does not have scenes', async () =>
  withFixture('multiple-plays-no-default', async () => {
    await expect(runAction('act-with-no-scenes')).rejects.toThrowError(getActsReadErrorRegExp)
  }))

test('should error if a play does not have acts', async () =>
  withFixture('multiple-plays-no-default', async () => {
    await expect(runAction('no-acts')).rejects.toThrowError(`No acts found in the 'no-acts.play' play.`)
  }))

test('should log multiple acts', async () =>
  withFixture('multiple-plays-no-default', async ({ log, question }) => {
    await runAction('multiple-acts')

    expect(question).toHaveBeenCalledTimes(3)

    expect(log).toHaveBeenCalledTimes(4)
    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput('Multiple Acts'))
    expect(log).toHaveBeenNthCalledWith(2, getActOutput(1, 'Act 1'))
    expect(log).toHaveBeenNthCalledWith(3, getActOutput(2, 'Act 2'))
    expect(log).toHaveBeenNthCalledWith(4, getActOutput(3, 'Act 3'))

    // TODO(HiDeoo) steps
  }))

function getPlayNameOutput(fileNameOrName: string) {
  return `Starting play '${fileNameOrName}':`
}

function getActOutput(index: number, title: string) {
  return `#${index} ${title}`
}
