import { expect } from 'vitest'

import { type Act } from '../src/libs/act'

expect.extend({
  toMatchAct(received: Act, expected: ActMatcherOptions) {
    return {
      message: () =>
        `expected ${this.utils.stringify(received)} to${this.isNot ? ' not' : ''} match ${this.utils.stringify(
          expected
        )}`,
      pass: this.equals(received, { path: expect.stringMatching(new RegExp(`${expected.fileName}\\.act$`)) }),
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
