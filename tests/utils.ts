import path from 'node:path'

import { type SpyInstance, vi } from 'vitest'

import * as play from '../src/constants/play'

export async function withFixture(fixtureName: string, test: (testParams: TestParameters) => Promise<void>) {
  const playsPathSpy = vi
    .spyOn(play, 'PLAYS_DIRECTORY', 'get')
    .mockReturnValue(path.join('fixtures', fixtureName, play.PLAYS_DIRECTORY))

  const logMock = vi.spyOn(console, 'log').mockImplementation(() => undefined)

  try {
    await test({ log: logMock })
  } finally {
    logMock.mockRestore()
    playsPathSpy.mockRestore()
  }
}

interface TestParameters {
  log: SpyInstance
}
