import path from 'node:path'

import { vi } from 'vitest'

import * as act from '../src/constants/act'

export async function withFixture(fixtureName: string, test: () => Promise<void>) {
  const actsPathSpy = vi
    .spyOn(act, 'ACTS_DIRECTORY', 'get')
    .mockReturnValue(path.join('fixtures', fixtureName, act.ACTS_DIRECTORY))

  try {
    await test()

    actsPathSpy.mockRestore()
  } finally {
    actsPathSpy.mockRestore()
  }
}
