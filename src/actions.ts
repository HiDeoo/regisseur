import { bold, cyan, dim, red } from 'kolorist'

import { ACTS_DIRECTORY } from './constants/act'
import { findAllActs } from './libs/act'
import { pluralize } from './libs/string'

export async function listAction() {
  const acts = await findAllActs()

  if (acts.all.length === 0) {
    console.log(red(`No acts found in the '${ACTS_DIRECTORY}' directory.`))

    return
  }

  console.log(cyan(`Found ${acts.all.length} ${pluralize(acts.all.length, 'act')}:`))

  for (const act of acts.all) {
    const isDefaultAct = act.path === acts.def?.path

    console.log(`  ${isDefaultAct ? bold('*') : dim('-')} ${isDefaultAct ? bold(act.path) : act.path}`)
  }
}
