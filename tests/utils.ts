import path from 'node:path'
import readline, { type Interface } from 'node:readline'

import { type SpyInstance, vi } from 'vitest'

import * as play from '../src/constants/play'
import { defaultConfirmationString } from '../src/libs/act'

export async function withFixture(fixtureName: string, test: (testParams: TestParameters) => Promise<void>) {
  const playsPathSpy = vi
    .spyOn(play, 'PLAYS_DIRECTORY', 'get')
    .mockReturnValue(path.join('fixtures', fixtureName, play.PLAYS_DIRECTORY))

  const logMock = vi.spyOn(console, 'log').mockImplementation(() => undefined)

  let questionCount = 0
  let answers: string[]

  const mockAnswers: TestParameters['mockAnswers'] = (mockedAnswers) => {
    answers = mockedAnswers
  }

  const questionMock = vi.fn().mockImplementation((_query: string, callback: (answer: string) => void) => {
    callback((answers ? answers[questionCount++] : undefined) ?? defaultConfirmationString)
  })

  const rlMock = vi.spyOn(readline, 'createInterface').mockReturnValue({
    close: vi.fn(),
    on: vi.fn(),
    question: questionMock,
  } as unknown as Interface)

  try {
    await test({ log: logMock, mockAnswers, question: questionMock })
  } finally {
    rlMock.mockRestore()
    logMock.mockRestore()
    playsPathSpy.mockRestore()
  }
}

interface TestParameters {
  log: SpyInstance
  mockAnswers: (answers: string[]) => void
  question: SpyInstance
}
