
export function take<T>(generator: Generator<T> | AsyncGenerator<T>, amount?: number) {
  if (!amount) {
    return (n: number) => {
      if (n < 1) {
        throw new Error('Please provide an amount of at least 1!');
      }
      n = Math.floor(n);
      const result = [];
      // @ts-ignore
      for (const g of generator) {
        result.push(g);
        if (--n === 0) {
          break;
        }
      }
      if (result[0] instanceof Promise) {
        return Promise.all(result);
      } else {
        return result;
      }
    };
  } else {
    return take(generator)(amount);
  }
}
