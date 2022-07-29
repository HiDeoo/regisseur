import fs from 'node:fs/promises'
import path from 'node:path'

import glob from 'tiny-glob'

import { ACTS_DIRECTORY, ACT_EXTENSION } from '../constants/act'

export async function findAllActs(): Promise<Acts> {
  await isActDirectoryPresent()

  const actPaths = await glob(path.join(ACTS_DIRECTORY, `*.${ACT_EXTENSION}`))

  const acts: Acts = { all: [] }

  acts.all = actPaths.map((actPath) => {
    const act = { path: actPath }

    if (path.basename(actPath) === `default.${ACT_EXTENSION}`) {
      acts.def = act
    }

    return act
  })

  if (!acts.def && acts.all.length === 1 && acts.all[0]) {
    acts.def = acts.all[0]
  }

  return acts
}

async function isActDirectoryPresent(): Promise<true> {
  try {
    await fs.access(ACTS_DIRECTORY)

    return true
  } catch {
    throw new Error(`Could not locate '${ACTS_DIRECTORY}' directory. It should be located at the root of your project.`)
  }
}

interface Acts {
  all: Act[]
  def?: Act // Default but aliased to avoid the reserved keyword.
}

export interface Act {
  path: string
}
