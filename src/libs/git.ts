import { simpleGit } from 'simple-git'
import { z } from 'zod'

import { errorWithCause } from './error'

export const gitValidationSchema = z.object({
  clean: z.boolean().optional(),
})

export async function runGitValidations(validation: GitValidation) {
  if (Object.values(validation).every((value) => value === false)) {
    return
  }

  await runRepoValidation()

  if (validation.clean) {
    await runCleanValidation()
  }
}

async function runRepoValidation() {
  try {
    await getStatus()
  } catch (error) {
    if (error instanceof Error && error.cause?.message.includes('not a git repository')) {
      throw new Error('Cannot run this play including git validations outside of a git repository.')
    }

    throw error
  }
}

async function runCleanValidation() {
  const status = await getStatus()

  if (!status.isClean()) {
    throw new Error('The working tree is not clean. Clean it before running this play.')
  }
}

async function getStatus() {
  try {
    const status = await simpleGit().status()

    return status
  } catch (error) {
    throw errorWithCause(`Could not get the status of the repository.`, error)
  }
}

export type GitValidation = z.infer<typeof gitValidationSchema>
