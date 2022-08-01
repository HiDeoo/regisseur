import path from 'node:path'

import { vi } from 'vitest'

import * as play from '../src/constants/play'

export async function withFixture(fixtureName: string, test: () => Promise<void>) {
  const playsPathSpy = vi
    .spyOn(play, 'PLAYS_DIRECTORY', 'get')
    .mockReturnValue(path.join('fixtures', fixtureName, play.PLAYS_DIRECTORY))

  try {
    await test()

    playsPathSpy.mockRestore()
  } finally {
    playsPathSpy.mockRestore()
  }
}
