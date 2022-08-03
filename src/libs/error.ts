import { bold, cyan } from 'kolorist'
import { type ZodError } from 'zod'
import { generateErrorMessage } from 'zod-error'

import { type Play } from './play'

export function errorWithCause(message: string, cause: unknown) {
  const error = new Error(message)

  if (cause instanceof Error) {
    error.cause = cause
  }

  return error
}

export function logValidationError(error: ZodError) {
  console.error(
    'Validation error:',
    generateErrorMessage(error.issues, { delimiter: { component: ' - ', error: '\n\t' }, prefix: '\n\t' })
  )
}

export class UserAbortError extends Error {
  constructor(private play: Play, private actIndex: number) {
    super()
    Object.setPrototypeOf(this, new.target.prototype)
  }

  override toString() {
    const actNumber = this.actIndex + 1

    return `\nTo ${cyan('resume')} from act #${actNumber}, use '${bold(
      `regisseur ${this.play.fileName} -c ${actNumber}`
    )}'.`
  }
}
