import { expect } from 'vitest'

import { ACT_EXTENSION } from '../src/constants/act'
import { type Act } from '../src/libs/act'

expect.extend({
  toMatchAct(received: Act, expected: ActMatcherOptions) {
    return {
      message: () =>
        `expected ${this.utils.stringify(received)} to${this.isNot ? ' not' : ''} match ${this.utils.stringify(
          expected
        )}`,
      pass: this.equals(received, {
        fileName: `${expected.fileName}.${ACT_EXTENSION}`,
        path: expect.stringMatching(new RegExp(`${expected.fileName}\\.${ACT_EXTENSION}$`)),
      }),
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
}
