import { expect } from 'vitest'

import { PLAY_EXTENSION } from '../src/constants/play'
import { type Play } from '../src/libs/play'

expect.extend({
  toMatchPlay(received: Play, expected: PlayMatcherOptions) {
    let pass: boolean =
      this.equals(`${expected.fileName}.${PLAY_EXTENSION}`, received.fileName) &&
      this.equals(expect.stringMatching(new RegExp(`${expected.fileName}\\.${PLAY_EXTENSION}$`)), received.path) &&
      this.equals(expect.anything(), received.content)

    if (expected.name && pass) {
      pass = this.equals(received.name, expected.name)
    }

    return {
      message: () =>
        `Expected play to ${this.isNot ? ' not' : ''}match:
  ${this.utils.printExpected(expected)}
Received:
  ${this.utils.printReceived(received)}`,
      pass,
    }
  },
})

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}

interface CustomMatchers<R = unknown> {
  toMatchPlay(options: PlayMatcherOptions): R
}

interface PlayMatcherOptions {
  fileName: string
  name?: string
}
