import { expect } from 'vitest'

import { ACT_EXTENSION } from '../src/constants/act'
import { type Act } from '../src/libs/act'

expect.extend({
  toMatchAct(received: Act, expected: ActMatcherOptions) {
    let pass: boolean =
      this.equals(`${expected.fileName}.${ACT_EXTENSION}`, received.fileName) &&
      this.equals(expect.stringMatching(new RegExp(`${expected.fileName}\\.${ACT_EXTENSION}$`)), received.path) &&
      this.equals(expect.anything(), received.content)

    if (expected.name && pass) {
      pass = this.equals(received.name, expected.name)
    }

    return {
      message: () =>
        `Expected act to ${this.isNot ? ' not' : ''}match:
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
  toMatchAct(options: ActMatcherOptions): R
}

interface ActMatcherOptions {
  fileName: string
  name?: string
}
