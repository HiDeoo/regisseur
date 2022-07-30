import fs from 'node:fs/promises'

import { parse } from 'hjson'
import { z } from 'zod'

import { errorWithCause } from './error'

const nameSchema = z.object({
  name: z.string().optional(),
})

export async function getContent(path: string): Promise<NameAndContent> {
  try {
    const file = await fs.readFile(path, 'utf8')
    const content = parse(file)
    const { name } = nameSchema.parse(content)

    const nameAndContent: NameAndContent = { content }

    if (name) {
      nameAndContent.name = name
    }

    return nameAndContent
  } catch (error) {
    throw errorWithCause(`Could not read the act file at '${path}'.`, error)
  }
}

export interface NameAndContent {
  name?: string
  content: unknown
}
