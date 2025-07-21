export function chunkArray<T>(array: T[], size: number): T[][] {
  if (array.length < size) return [array]
  
  const chunkedArray: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunkedArray.push(array.slice(i, i + size));
  }
  
  return chunkedArray;
}
