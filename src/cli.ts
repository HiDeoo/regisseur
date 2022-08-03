import cac from 'cac'
import { red } from 'kolorist'
import { ZodError } from 'zod'

import { runAction, listAction, validateAction } from './actions'
import { logValidationError, UserAbortError } from './libs/error'

const cli = cac('regisseur')

cli.help()

// FIXME(HiDeoo)
cli.command('[play]', '// TODO').option('-c, --continue <act_number>', '// TODO').action(runAction)
cli.command('list', '// TODO').action(listAction)
cli.command('validate [play]', '// TODO').action(validateAction)

async function run() {
  try {
    cli.parse(process.argv, { run: false })

    await cli.runMatchedCommand()
  } catch (error) {
    if (error instanceof UserAbortError) {
      console.log(error.toString())

      process.exit(1)
    }

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
