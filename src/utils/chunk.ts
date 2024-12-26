export function chunk<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array))
    throw new TypeError(`ArrayChunk(array, size): 'array' should be an array.`);

  if (typeof size !== "number")
    throw new TypeError(`ArrayChunk(array, size): 'size' should be number.`);

  if (size < 1)
    throw new RangeError(
      `ArrayChunk(array, size): 'size' should be greater than 0.`
    );

  const clone = array.slice();

  return new Array(Math.ceil(clone.length / size))
    .fill(0)
    .map((_) => clone.splice(0, size));
}
