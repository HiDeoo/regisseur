import fs from 'node:fs/promises'
import path from 'node:path'

import glob from 'tiny-glob'

import { ACTS_DIRECTORY, ACT_EXTENSION } from '../constants/act'

export async function findAllActs(): Promise<Acts> {
  await ensureActDirectory()

  const actPaths = await glob(path.join(ACTS_DIRECTORY, `*.${ACT_EXTENSION}`))

  const acts: Acts = { all: [] }

  acts.all = actPaths.map((actPath) => {
    const act = getActFromPath(actPath)

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

export async function findAct(pathOrFileNameOrName: string | undefined) {
  /**
   * The resolution algorithm is as follows:
   *
   * 1. If the `pathOrFileNameOrName` is not defined, we use `findAllActs()` to find the default act if any.
   * 2. If the `pathOrFileNameOrName` is defined, we check if it is a valid path poiting to an act file.
   * 3. If the `pathOrFileNameOrName` is not a valid path, we check if an act returned by `findAllActs()` has the same
   *    file name.
   * 4. If the `pathOrFileNameOrName` is not a valid act file name, we check if an act returned by `findAllActs()` has
   *    the same act name.
   */

  if (!pathOrFileNameOrName) {
    const acts = await findAllActs()

    if (!acts.def) {
      throw new Error(
        `No default act found in the '${ACTS_DIRECTORY}' directory. It should be a 'default.${ACT_EXTENSION}' file.`
      )
    }

    return acts.def
  }

  const actPathExists = await actFileExists(pathOrFileNameOrName)

  if (actPathExists) {
    return getActFromPath(pathOrFileNameOrName)
  }

  const acts = await findAllActs()

  const actMatchingFileName = acts.all.find(
    (act) => act.fileName === pathOrFileNameOrName || act.fileName === `${pathOrFileNameOrName}.${ACT_EXTENSION}`
  )

  if (actMatchingFileName) {
    return actMatchingFileName
  }

  // TODO(HiDeoo)
  // const actMatchingName = acts.all.find((act) => act.name === pathOrFileNameOrName)

  // if (actMatchingName) {
  //   return actMatchingName
  // }

  throw new Error('Could not find an act matching the given path, file name or name.')
}

function getActFromPath(actPath: string): Act {
  return {
    fileName: path.basename(actPath),
    path: actPath,
  }
}

async function actFileExists(actPath: string) {
  try {
    await fs.access(actPath)

    return true
  } catch {
    return false
  }
}

async function ensureActDirectory(): Promise<true> {
  try {
    await fs.access(ACTS_DIRECTORY)

    return true
  } catch {
    throw new Error(`Could not locate '${ACTS_DIRECTORY}' directory. It should be at the root of your project.`)
  }
}

interface Acts {
  all: Act[]
  def?: Act // Default but aliased to avoid the reserved keyword.
}

export interface Act {
  fileName: string
  path: string
}
