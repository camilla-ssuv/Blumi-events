// React 18 não aceita async em startTransition nas definições de tipo,
// mas funciona em runtime. Este override silencia o erro de TS.
import 'react'

declare module 'react' {
  function startTransition(scope: () => void | Promise<void>): void
  interface TransitionStartFunction {
    (scope: () => void | Promise<void>): void
  }
}
