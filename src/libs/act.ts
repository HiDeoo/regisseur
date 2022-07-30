import fs from 'node:fs/promises'
import path from 'node:path'

import glob from 'tiny-glob'

import { ACTS_DIRECTORY, ACT_EXTENSION } from '../constants/act'

import { getContent, type NameAndContent } from './content'

export async function findAllActs(): Promise<Acts> {
  await ensureActDirectory()

  const actPaths = await glob(path.join(ACTS_DIRECTORY, `*.${ACT_EXTENSION}`))

  const acts: Acts = { all: [] }

  acts.all = await Promise.all(
    actPaths.map(async (actPath) => {
      const act = await getActFromPath(actPath)

      if (path.basename(actPath) === `default.${ACT_EXTENSION}`) {
        acts.def = act
      }

      return act
    })
  )

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

  const acts = await findAllActs()

  if (!pathOrFileNameOrName) {
    if (!acts.def) {
      throw new Error(
        `No default act found in the '${ACTS_DIRECTORY}' directory. It should be a 'default.${ACT_EXTENSION}' file.`
      )
    }

    return acts.def
  }

  const actPath = await actFileExists(pathOrFileNameOrName)

  if (actPath) {
    const actMatchingPath = acts.all.find((act) => act.path === actPath)

    if (actMatchingPath) {
      return actMatchingPath
    }
  }

  const actMatchingFileName = acts.all.find(
    (act) => act.fileName === pathOrFileNameOrName || act.fileName === `${pathOrFileNameOrName}.${ACT_EXTENSION}`
  )

  if (actMatchingFileName) {
    return actMatchingFileName
  }

  const actMatchingName = acts.all.find((act) => act.name === pathOrFileNameOrName)

  if (actMatchingName) {
    return actMatchingName
  }

  throw new Error('Could not find an act matching the given path, file name or name.')
}

async function getActFromPath(actPath: string): Promise<Act> {
  const content = await getContent(actPath)

  return {
    ...content,
    fileName: path.basename(actPath),
    path: path.resolve(actPath),
  }
}

async function actFileExists(actPath: string) {
  try {
    await fs.access(actPath)

    return path.resolve(actPath)
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

export type Act = {
  fileName: string
  path: string
} & NameAndContent
