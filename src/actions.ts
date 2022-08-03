import path from 'node:path'

import { bold, cyan, dim, green, red } from 'kolorist'

import { PLAYS_DIRECTORY } from './constants/play'
import { getActs, playActs } from './libs/act'
import { findPlay, findAllPlays } from './libs/play'
import { pluralize } from './libs/string'

export async function runAction(pathOrFileNameOrName: string | undefined, options: RunOptions = {}) {
  const play = await findPlay(pathOrFileNameOrName)
  const acts = getActs(play)

  const nameOrFileName = play.name ?? play.fileName

  if (acts.length === 0) {
    throw new Error(`No acts found in the '${nameOrFileName}' play.`)
  }

  if (typeof options.continue === 'number' && !acts[options.continue - 1]) {
    throw new Error(`The act number '${options.continue}' is not valid.`)
  }

  console.log(cyan(`Starting play '${nameOrFileName}'.`))

  await playActs(play, acts, typeof options.continue === 'number' ? options.continue - 1 : 0)
}

export async function listAction() {
  const plays = await findAllPlays()

  if (plays.all.length === 0) {
    console.log(red(`No plays found in the '${PLAYS_DIRECTORY}' directory.`))

    return
  }

  console.log(cyan(`Found ${plays.all.length} ${pluralize(plays.all.length, 'play')}:`))

  for (const play of plays.all) {
    const isDefaultPlay = play.path === plays.def?.path
    const playPath = path.basename(play.path)

    console.log(
      `  ${isDefaultPlay ? bold('*') : dim('-')} ${isDefaultPlay ? bold(playPath) : playPath}${
        play.name ? dim(` (name: ${play.name})`) : ''
      }`
    )
  }
}

export async function validateAction(pathOrFileNameOrName: string | undefined) {
  const play = await findPlay(pathOrFileNameOrName)
  getActs(play)

  console.log(`The play '${play.name ?? play.fileName}' is ${green('valid')}.`)
}

interface RunOptions {
  continue?: number // The act number starts at 1.
}
