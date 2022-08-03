export function pluralize(count: number, word: string): string {
  return word + (count === 1 ? '' : 's')
}
