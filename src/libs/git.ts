import { simpleGit } from 'simple-git'
import { z } from 'zod'

import { errorWithCause } from './error'

export const gitValidationSchema = z.object({
  branch: z.string().optional(),
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

  if (validation.branch) {
    await runBranchValidation(validation.branch)
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

async function runBranchValidation(branch: GitValidation['branch']) {
  const status = await getStatus()

  if (status.current !== branch) {
    throw new Error(`This play should only be run on the '${branch}' branch. Switch before running this play.`)
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
