import { type ZodError } from 'zod'
import { generateErrorMessage } from 'zod-error'

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
