/**
 * Splits an array into smaller chunks of a specified size.
 * Useful for processing data in batches (e.g., Firestore batch limits).
 * 
 * @param array The array to split
 * @param size The maximum size of each chunk
 * @returns An array of chunks
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
