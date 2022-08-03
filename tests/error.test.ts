import { expect, test } from 'vitest'

import { UserAbortError } from '../src/libs/error'

test('should log the command to resume play', async () => {
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
