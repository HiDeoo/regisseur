import cac from 'cac'
import { bold, cyan, dim, red } from 'kolorist'

import { ACTS_DIRECTORY } from './constants/act'
import { pluralize } from './libs/string'

import { findAllActs } from '.'

const cli = cac('regisseur')

cli.help()

cli.command('[file]', '// TODO').action(() => {
  console.log('no command')
})

cli.command('list', '// TODO').action(async () => {
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
})

async function run() {
  try {
    cli.parse(process.argv, { run: false })

    await cli.runMatchedCommand()
  } catch (error) {
    const isError = error instanceof Error

    console.error(red(`${isError ? error.message : error}`))

    if (isError && error.cause) {
      console.error(error.cause)
    }

    process.exit(1)
  }
}

run()
