import readline from 'node:readline'

import { bold, dim } from 'kolorist'
import { z } from 'zod'

import { errorWithCause, UserAbortError } from './error'
import { type Play } from './play'

const actSchema = z
  .object({
    title: z.string(),
    scenes: z.string().array(),
  })
  .strict()

const contentSchema = z.object({
  acts: actSchema.array(),
})

export const defaultConfirmationString = 'done'
export const defaultCancellationString = 'stop'

export function getActs(play: Play): Act[] {
  try {
    const content = contentSchema.parse(play.content)

    return content.acts
  } catch (error) {
    throw errorWithCause(`Could not read acts from the play file at '${play.path}'.`, error)
  }
}

export async function playActs(acts: Act[]) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.on('SIGINT', () => {
    process.exit(1)
  })

  try {
    for (const [index, act] of acts.entries()) {
      await playAct(index, act, rl)
    }
  } finally {
    rl.close()
  }
}

function playAct(index: number, act: Act, rl: readline.Interface) {
  console.log(`\n${dim(`#${index + 1}`)} ${bold(act.title)}`)

  for (const scene of act.scenes) {
    console.log(` ${dim('-')} ${scene}`)
  }

  return confirmAct(index, act, rl)
}

function confirmAct(index: number, act: Act, rl: readline.Interface, reconfirm = false) {
  return new Promise<void>((resolve, reject) => {
    rl.question(
      `${
        reconfirm ? '' : '\n'
      }Type '${defaultConfirmationString}' or '${defaultCancellationString}' when you're done: `,
      async (answer) => {
        if (answer === defaultConfirmationString) {
          return resolve()
        } else if (answer === defaultCancellationString) {
          return reject(new UserAbortError())
        }

        try {
          await confirmAct(index, act, rl, true)

          return resolve()
        } catch {
          return reject(new UserAbortError())
        }
      }
    )
  })
}

export type Act = z.infer<typeof actSchema>
