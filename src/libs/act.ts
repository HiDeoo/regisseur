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

export function getActs(play: Play): Act[] {
  try {
    const content = contentSchema.parse(play.content)

    return content.acts
  } catch (error) {
    throw errorWithCause(`Could not read acts from the play file at '${play.path}'.`, error)
  }
}

export type Act = z.infer<typeof actSchema>
