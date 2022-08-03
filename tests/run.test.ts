import { simpleGit } from 'simple-git'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ZodError } from 'zod'

import { runAction } from '../src/actions'
import { PLAYS_DIRECTORY, PLAY_EXTENSION } from '../src/constants/play'
import { UserAbortError } from '../src/libs/error'
import { findPlay } from '../src/libs/play'

import { withFixture } from './utils'

const getActsReadErrorRegExp = /^Could not read acts from the play file at /

vi.mock('simple-git')

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

test('should run a single act', async () =>
  withFixture('multiple-plays-no-default', async ({ log, question }) => {
    await runAction('single-act')

    expect(question).toHaveBeenCalledTimes(1)

    expect(log).toHaveBeenCalledTimes(5)
    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput('multiple-acts'))

    expect(log).toHaveBeenNthCalledWith(2, getActOutput(1, 'Act 1'))
    expect(log).toHaveBeenNthCalledWith(3, getSceneOutput('Do the thing 1'))
    expect(log).toHaveBeenNthCalledWith(4, getSceneOutput('Do the thing 2'))
    expect(log).toHaveBeenNthCalledWith(5, getSceneOutput('Do the thing 3'))
  }))

test('should run multiple acts', async () =>
  withFixture('multiple-plays-no-default', async ({ log, question }) => {
    await runAction('multiple-acts')

    expect(question).toHaveBeenCalledTimes(3)

    expect(log).toHaveBeenCalledTimes(13)
    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput('Multiple Acts'))

    expect(log).toHaveBeenNthCalledWith(2, getActOutput(1, 'Act 1'))
    expect(log).toHaveBeenNthCalledWith(3, getSceneOutput('Do the thing 1.1'))
    expect(log).toHaveBeenNthCalledWith(4, getSceneOutput('Do the thing 1.2'))
    expect(log).toHaveBeenNthCalledWith(5, getSceneOutput('Do the thing 1.3'))

    expect(log).toHaveBeenNthCalledWith(6, getActOutput(2, 'Act 2'))
    expect(log).toHaveBeenNthCalledWith(7, getSceneOutput('Do the thing 2.1'))
    expect(log).toHaveBeenNthCalledWith(8, getSceneOutput('Do the thing 2.2'))
    expect(log).toHaveBeenNthCalledWith(9, getSceneOutput('Do the thing 2.3'))

    expect(log).toHaveBeenNthCalledWith(10, getActOutput(3, 'Act 3'))
    expect(log).toHaveBeenNthCalledWith(11, getSceneOutput('Do the thing 3.1'))
    expect(log).toHaveBeenNthCalledWith(12, getSceneOutput('Do the thing 3.2'))
    expect(log).toHaveBeenNthCalledWith(13, getSceneOutput('Do the thing 3.3'))
  }))

test('should run and stop at a specific act', async () =>
  withFixture('multiple-plays-no-default', async ({ log, mockAnswers, question }) => {
    mockAnswers(['done', 'stop'])

    await expect(runAction('multiple-acts')).rejects.toThrowError(UserAbortError)

    expect(question).toHaveBeenCalledTimes(2)

    expect(log).toHaveBeenCalledTimes(9)
    expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput('Multiple Acts'))

    expect(log).toHaveBeenNthCalledWith(2, getActOutput(1, 'Act 1'))
    expect(log).toHaveBeenNthCalledWith(3, getSceneOutput('Do the thing 1.1'))
    expect(log).toHaveBeenNthCalledWith(4, getSceneOutput('Do the thing 1.2'))
    expect(log).toHaveBeenNthCalledWith(5, getSceneOutput('Do the thing 1.3'))

    expect(log).toHaveBeenNthCalledWith(6, getActOutput(2, 'Act 2'))
    expect(log).toHaveBeenNthCalledWith(7, getSceneOutput('Do the thing 2.1'))
    expect(log).toHaveBeenNthCalledWith(8, getSceneOutput('Do the thing 2.2'))
    expect(log).toHaveBeenNthCalledWith(9, getSceneOutput('Do the thing 2.3'))
  }))

test('should ask for a confirmation token until it is valid', async () =>
  withFixture('multiple-plays-no-default', async ({ mockAnswers, question }) => {
    mockAnswers(['test', 'hello', 'world', 'done', 'help', 'stop'])

    await expect(runAction('multiple-acts')).rejects.toThrowError(UserAbortError)

    expect(question).toHaveBeenCalledTimes(6)
  }))

test('should error when trying to continue from an invalid act', async () =>
  withFixture('multiple-plays-no-default', async () => {
    let invalidActNumber = 15

    await expect(runAction('multiple-acts', { continue: invalidActNumber })).rejects.toThrowError(
      `The act number '${invalidActNumber}' is not valid.`
    )

    invalidActNumber = 0

    await expect(runAction('multiple-acts', { continue: invalidActNumber })).rejects.toThrowError(
      `The act number '${invalidActNumber}' is not valid.`
    )
  }))

test.each([1, 2, 3])('should continue from the act #%d', async (startAt) =>
  withFixture('multiple-plays-no-default', async ({ log, question }) => {
    await runAction('multiple-acts', { continue: startAt })

    expect(question).toHaveBeenCalledTimes(3 - startAt + 1)

    expect(log).toHaveBeenCalledTimes(13 - (startAt * 4 - 4))
    expect(log).toHaveBeenCalledWith(getPlayNameOutput('Multiple Acts'))

    if (startAt === 1) {
      expect(log).toHaveBeenCalledWith(getActOutput(1, 'Act 1'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 1.1'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 1.2'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 1.3'))
    }

    if (startAt === 2) {
      expect(log).toHaveBeenCalledWith(getActOutput(2, 'Act 2'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 2.1'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 2.2'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 2.3'))
    }

    if (startAt === 3) {
      expect(log).toHaveBeenCalledWith(getActOutput(3, 'Act 3'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 3.1'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 3.2'))
      expect(log).toHaveBeenCalledWith(getSceneOutput('Do the thing 3.3'))
    }
  })
)

test('should use the default confirmation string', async () =>
  withFixture('multiple-plays-no-default', async ({ question }) => {
    await runAction('single-act')

    expect(question).toHaveBeenCalledTimes(1)
    expect(question).toHaveBeenCalledWith("\nType 'done' or 'stop' when you're done: ", expect.any(Function))
  }))

test('should use a custom confirmation string', async () =>
  withFixture('multiple-plays-no-default', async ({ question }) => {
    await runAction('single-act-confirmation')

    expect(question).toHaveBeenCalledTimes(1)
    expect(question).toHaveBeenCalledWith("\nType 'yes' or 'stop' when you're done: ", expect.any(Function))
  }))

test('should use multiple confirmation strings', async () =>
  withFixture('multiple-plays-no-default', async ({ question }) => {
    await runAction('multiple-acts-confirmations')

    expect(question).toHaveBeenCalledTimes(3)
    expect(question).toHaveBeenNthCalledWith(1, "\nType 'ok' or 'stop' when you're done: ", expect.any(Function))
    expect(question).toHaveBeenNthCalledWith(2, "\nType 'yes' or 'stop' when you're done: ", expect.any(Function))
    expect(question).toHaveBeenNthCalledWith(3, "\nType 'valid' or 'stop' when you're done: ", expect.any(Function))
  }))

describe('git validations', () => {
  afterEach(() => {
    simpleGit().mockRepo(true)
    simpleGit().mockClean(true)
  })

  test('should error with git validation outside of a git repo', async () =>
    withFixture('git-validation', async ({ log }) => {
      simpleGit().mockRepo(false)

      await expect(runAction('clean')).rejects.toThrowError(
        'Cannot run this play including git validations outside of a git repository.'
      )

      expect(log).not.toHaveBeenCalled()
    }))

  test('should run a play with with git clean validation in a clean working tree', async () =>
    withFixture('git-validation', async ({ log }) => {
      simpleGit().mockClean(true)

      await runAction('clean')

      expect(log).toHaveBeenNthCalledWith(1, getPlayNameOutput('clean.play'))
    }))

  test('should error with git clean validation in an uncleaned working tree', async () =>
    withFixture('git-validation', async ({ log }) => {
      simpleGit().mockClean(false)

      await expect(runAction('clean')).rejects.toThrowError(
        'The working tree is not clean. Clean it before running this play.'
      )

      expect(log).not.toHaveBeenCalled()
    }))
})

function getPlayNameOutput(fileNameOrName: string) {
  return `Starting play '${fileNameOrName}'.`
}

function getActOutput(index: number, title: string) {
  return `\n#${index} ${title}`
}

function getSceneOutput(text: string) {
  return ` - ${text}`
}
