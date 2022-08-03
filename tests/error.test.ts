import { expect, test, vi } from 'vitest'
import { z, ZodError } from 'zod'

import { logValidationError, UserAbortError } from '../src/libs/error'

test('should log the command to resume a play', async () => {
  expect(
    new UserAbortError(
      {
        content: undefined,
        fileName: 'test.play',
        name: 'test',
        path: 'test.play',
      },
      4
    ).toString()
  ).toMatchInlineSnapshot(`
    "
    To resume from act #5, use 'regisseur test.play -c 5'."
  `)
})

test('should log a validation error', async () => {
  expect.assertions(2)

  try {
    const schema = z.object({
      title: z.string(),
      count: z.number(),
    })

    schema.parse({ title: 1, count: 'a' })
  } catch (error) {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    if (error instanceof ZodError) {
      logValidationError(error)
    }

    expect(consoleErrorSpy).toHaveBeenCalledOnce()
    expect(consoleErrorSpy.mock.lastCall).toMatchInlineSnapshot(`
      [
        "Validation error:",
        "
      	Code: invalid_type - Path: title - Message: Expected string, received number
      	Code: invalid_type - Path: count - Message: Expected number, received string",
      ]
    `)

    consoleErrorSpy.mockRestore()
  }
})
