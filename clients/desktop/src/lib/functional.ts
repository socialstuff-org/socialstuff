
function extractValuesFromIterator<T>(i: { value: T, done: boolean }[]): T[] {
  return i.filter(x => !x.done).map(x => x.value);
}

export function take<T>(generator: Generator<T>): ((n: number) => T[]);
export function take<T>(generator: Generator<T>, amount: number): T[];
export function take<T>(generator: AsyncGenerator<T>): ((n: number) => Promise<T[]>);
export function take<T>(generator: AsyncGenerator<T>, amount: number): Promise<T[]>;
export function take<T>(generator: Generator<T> | AsyncGenerator<T>, amount?: number): ((n: number) => T[] | Promise<T[]>) | T[] | Promise<T[]> {
  if (!amount) {
    return (n: number) => {
      if (n < 1) {
        throw new Error('Please provide an amount of at least 1!');
      }
      n = Math.floor(n);
      const result = [];
      do {
        result.push(generator.next());
      } while (--n > 0);
      

      if (result[0] instanceof Promise) {
        return Promise.all(result).then(extractValuesFromIterator) as Promise<T[]>;
      } else {
        return extractValuesFromIterator(result);
      }
    };
  } else {
    // @ts-ignore
    return take(generator)(amount);
  }
}
