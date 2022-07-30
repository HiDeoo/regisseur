import cac from 'cac'
import { red } from 'kolorist'

import { listAction } from './actions'

const cli = cac('regisseur')

cli.help()

cli.command('[file]', '// TODO').action((file) => {
  console.log('🚨 [cli.ts:14] file', file)
})

cli.command('list', '// TODO').action(listAction)

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
