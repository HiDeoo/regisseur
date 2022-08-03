import fs from 'node:fs/promises'
import path from 'node:path'

import { parse } from 'hjson'
import glob from 'tiny-glob'
import { z } from 'zod'

import { PLAYS_DIRECTORY, PLAY_EXTENSION } from '../constants/play'

import { errorWithCause } from './error'
import { gitValidationSchema } from './git'

const metadataSchema = z.object({
  name: z.string().optional(),
  confirmation: z.string().optional(),
  git: gitValidationSchema.optional(),
})

export async function findAllPlays(): Promise<Plays> {
  await ensurePlaysDirectory()

  const playPaths = await glob(path.join(PLAYS_DIRECTORY, `*.${PLAY_EXTENSION}`))

  const plays: Plays = { all: [] }

  plays.all = await Promise.all(
    playPaths.map(async (playPath) => {
      const play = await getPlayFromPath(playPath)

      if (path.basename(playPath) === `default.${PLAY_EXTENSION}`) {
        plays.def = play
      }

      return play
    })
  )

  if (!plays.def && plays.all.length === 1 && plays.all[0]) {
    plays.def = plays.all[0]
  }

  return plays
}

export async function findPlay(pathOrFileNameOrName: string | undefined) {
  /**
   * The resolution algorithm is as follows:
   *
   * 1. If the `pathOrFileNameOrName` is not defined, we use `findAllPlays()` to find the default play if any.
   * 2. If the `pathOrFileNameOrName` is defined, we check if it is a valid path poiting to an play file.
   * 3. If the `pathOrFileNameOrName` is not a valid path, we check if an play returned by `findAllPlays()` has the same
   *    file name.
   * 4. If the `pathOrFileNameOrName` is not a valid play file name, we check if an play returned by `findAllPlays()`
   *    has the same play name.
   */

  const plays = await findAllPlays()

  if (!pathOrFileNameOrName) {
    if (!plays.def) {
      throw new Error(
        `No default play found in the '${PLAYS_DIRECTORY}' directory. It should be a 'default.${PLAY_EXTENSION}' file.`
      )
    }

    return plays.def
  }

  const playPath = await playFileExists(pathOrFileNameOrName)

  if (playPath) {
    const playMatchingPath = plays.all.find((play) => play.path === playPath)

    if (playMatchingPath) {
      return playMatchingPath
    }
  }

  const playMatchingFileName = plays.all.find(
    (play) => play.fileName === pathOrFileNameOrName || play.fileName === `${pathOrFileNameOrName}.${PLAY_EXTENSION}`
  )

  if (playMatchingFileName) {
    return playMatchingFileName
  }

  const playMatchingName = plays.all.find((play) => play.name === pathOrFileNameOrName)

  if (playMatchingName) {
    return playMatchingName
  }

  throw new Error('Could not find an play matching the given path, file name or name.')
}

async function getPlayFromPath(playPath: string): Promise<Play> {
  const data = await loadPlay(playPath)

  return {
    ...data,
    fileName: path.basename(playPath),
    path: path.resolve(playPath),
  }
}

async function playFileExists(playPath: string) {
  try {
    await fs.access(playPath)

    return path.resolve(playPath)
  } catch {
    return false
  }
}

async function ensurePlaysDirectory(): Promise<true> {
  try {
    await fs.access(PLAYS_DIRECTORY)

    return true
  } catch {
    throw new Error(`Could not locate '${PLAYS_DIRECTORY}' directory. It should be at the root of your project.`)
  }
}

async function loadPlay(playPath: string): Promise<PlayData> {
  try {
    const file = await fs.readFile(playPath, 'utf8')
    const content = parse(file)
    const { confirmation, git, name } = metadataSchema.parse(content)

    const data: PlayData = { content }

    if (confirmation) {
      data.confirmation = confirmation
    }

    if (git) {
      data.git = git
    }

    if (name) {
      data.name = name
    }

    return data
  } catch (error) {
    throw errorWithCause(`Could not read the play file at '${playPath}'.`, error)
  }
}

interface Plays {
  all: Play[]
  def?: Play // Default but aliased to avoid the reserved keyword.
}

export interface Play extends PlayMetadata {
  content: unknown
  fileName: string
  path: string
}

type PlayMetadata = z.infer<typeof metadataSchema>
type PlayData = Pick<Play, 'content' | 'name' | 'confirmation' | 'git'>
