import sharp from 'sharp';

const sampleSize = 32;
const hashSize = 8;

type PixelData = {
  data: Buffer;
  info: { width: number; height: number };
};

export async function perceptualHash(image: Buffer): Promise<string> {
  const pixels = (await sharp(image)
    .resize(sampleSize, sampleSize, { fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })) as PixelData;

  const coefficients: number[] = [];
  for (let frequencyY = 0; frequencyY < hashSize; frequencyY++) {
    for (let frequencyX = 0; frequencyX < hashSize; frequencyX++) {
      if (frequencyX === 0 && frequencyY === 0) {
        continue;
      }

      let coefficient = 0;
      for (let y = 0; y < sampleSize; y++) {
        for (let x = 0; x < sampleSize; x++) {
          coefficient +=
            pixels.data[y * pixels.info.width + x] *
            Math.cos(((2 * x + 1) * frequencyX * Math.PI) / (2 * sampleSize)) *
            Math.cos(((2 * y + 1) * frequencyY * Math.PI) / (2 * sampleSize));
        }
      }
      coefficients.push(coefficient);
    }
  }

  const sortedCoefficients = [...coefficients].sort((left, right) => left - right);
  const median = sortedCoefficients[Math.floor(sortedCoefficients.length / 2)];
  return coefficients.map((coefficient) => (coefficient > median ? '1' : '0')).join('');
}

export function hammingDistance(left: string, right: string): number {
  if (left.length !== right.length) {
    throw new Error('Perceptual hashes must have the same length.');
  }

  return [...left].reduce(
    (distance, bit, index) => distance + (bit === right[index] ? 0 : 1),
    0,
  );
}
