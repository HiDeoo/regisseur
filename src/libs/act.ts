import readline from 'node:readline'

import { bold, dim } from 'kolorist'
import { z } from 'zod'

import { errorWithCause } from './error'
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

  try {
    for (const [index, act] of acts.entries()) {
      await playAct(index, act, rl)
    }
  } catch (error) {
    // FIXME(HiDeoo)
    console.error('🚨 [act.ts:40] error', error)
  } finally {
    rl.close()
  }
}

function playAct(index: number, act: Act, rl: readline.Interface) {
  console.log(`\n${dim(`#${index + 1}`)} ${bold(act.title)}`)

  for (const scene of act.scenes) {
    console.log(` ${dim('-')} ${scene}`)
  }

  return new Promise<void>((resolve, reject) => {
    rl.question(`\nType '${defaultConfirmationString}' when you're done: `, (answer) => {
      if (answer === defaultConfirmationString) {
        return resolve()
      }

      return reject(new Error('User aborted.'))
    })
  })
}

export type Act = z.infer<typeof actSchema>
