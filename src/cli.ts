import cac from 'cac'
import { red } from 'kolorist'
import { ZodError } from 'zod'

import { runAction, listAction } from './actions'
import { logValidationError } from './libs/error'

const cli = cac('regisseur')

cli.help()

// FIXME(HiDeoo)
cli.command('[play]', '// TODO').action(runAction)
cli.command('list', '// TODO').action(listAction)

async function run() {
  try {
    cli.parse(process.argv, { run: false })

    await cli.runMatchedCommand()
  } catch (error) {
    const isError = error instanceof Error

    console.error(red(`${isError ? error.message : error}`))

    if (isError && error.cause) {
      if (error.cause instanceof ZodError) {
        logValidationError(error.cause)
      } else {
        console.error(error.cause)
      }
    }

    process.exit(1)
  }
}

run()
