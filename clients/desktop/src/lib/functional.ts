
function extractValuesFromIterator<T>(i: { value: T, done: boolean }[]): T[] {
  return i.filter(x => !x.done).map(x => x.value);
}

/**
 * Takes a generator and returns a function, via which rrays, containing the elements of the generator,
 * may be queried using the specified amount/size.
 * 
 * The size of the returned array(s) may be smaller as the requested number of elements, if the generator is fully consumed.
 * @param generator The generator to be consumed.
 */
export function take<T>(generator: Generator<T>): ((n: number) => T[]);
/**
 * Consumes the specified number of elements from a generator and returns them as an array.
 * @param generator The generator to be consumed.
 * @param amount The number of items to be consumed.
 */
export function take<T>(generator: Generator<T>, amount: number): T[];
/**
 * Takes a asynchronous generator and returns a function, via which rrays, containing the elements of the generator,
 * may be queried using the specified amount/size.
 * 
 * The size of the returned array(s) may be smaller as the requested number of elements, if the generator is fully consumed.
 * @param generator The asynchronous generator to be consumed.
 */
export function take<T>(generator: AsyncGenerator<T>): ((n: number) => Promise<T[]>);
/**
 * Consumes the specified number of elements from an asynchronous generator and returns them as an array in a promise.
 * @param generator The generator to be consumed.
 * @param amount The number of items to be consumed.
 */
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
