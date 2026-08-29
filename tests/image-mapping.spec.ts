import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { test, expect, type APIRequestContext } from '@playwright/test';
import { hammingDistance, perceptualHash } from './utils/perceptual-hash';

type Mapping = {
  image: string;
  region: string;
};

const csvPath = path.resolve(process.env.IMAGE_MAPPING_CSV ?? 'test-data/image_regions.csv');
const jsonPath = path.resolve(process.env.IMAGE_MAPPING_JSON ?? 'test-data/image_regions.json');
const jsonUrl = process.env.IMAGE_MAPPING_JSON_URL;
const maxHashDistance = Number(process.env.IMAGE_HASH_MAX_DISTANCE ?? 10);

function mappingKey(mapping: Mapping): string {
  return `${mapping.image}\u0000${mapping.region}`;
}

async function readMappings(request: APIRequestContext): Promise<{ csv: Mapping[]; json: Mapping[] }> {
  const csv = parse(await readFile(csvPath, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Mapping[];
  const json = jsonUrl
    ? ((await (await request.get(jsonUrl)).json()) as Mapping[])
    : (JSON.parse(await readFile(jsonPath, 'utf8')) as Mapping[]);
  return { csv, json };
}

test('CSV and JSON contain the same image-region mappings', async ({ request }) => {
  const { csv, json } = await readMappings(request);

  expect(csv, 'The CSV must contain at least one mapping.').not.toHaveLength(0);
  expect(json, 'The JSON must contain an array of mappings.').toBeInstanceOf(Array);
  expect(
    csv.map(mappingKey).sort(),
    'CSV and JSON must contain the same image-region rows.',
  ).toEqual(json.map(mappingKey).sort());
});

test('Xbox Japan page contains the xbox green image', async ({ page, request }) => {
  await expectXboxImageOnPage({
    page,
    request,
    pageUrl: 'https://www.xbox.com/ja-JP/',
    imageName: 'xbox green',
    assetPath: process.env.XBOX_JAPAN_ASSET ?? 'test-data/assets/xbox-green.png',
  });
});

test('Xbox UK page contains the xbox green image', async ({ page, request }) => {
  await expectXboxImageOnPage({
    page,
    request,
    pageUrl: 'https://www.xbox.com/en-GB/',
    imageName: 'xbox green',
    assetPath: process.env.XBOX_UK_ASSET ?? 'test-data/assets/xbox-green.png',
  });
});

test('Xbox US page contains the xbox white image', async ({ page, request }) => {
  await expectXboxImageOnPage({
    page,
    request,
    pageUrl: 'https://www.xbox.com/en-US/',
    imageName: 'xbox white',
    assetPath: process.env.XBOX_US_ASSET ?? 'test-data/assets/xbox-white.png',
  });
});

type PageImageCheck = {
  page: import('@playwright/test').Page;
  request: APIRequestContext;
  pageUrl: string;
  imageName: string;
  assetPath: string;
};

async function expectXboxImageOnPage({
  page,
  request,
  pageUrl,
  imageName,
  assetPath,
}: PageImageCheck): Promise<void> {
  const resolvedAssetPath = path.resolve(assetPath);
  test.skip(
    !(await fileExists(resolvedAssetPath)),
    `Add the ${imageName} asset at ${resolvedAssetPath} before running this image check.`,
  );

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  const imageUrls = await page.locator('img').evaluateAll((images: HTMLImageElement[]) =>
    [...new Set(
      images
        .map((image) => image.currentSrc || image.src)
        .filter((source): source is string => source.startsWith('http')),
    )],
  );
  expect(imageUrls, `No image URLs were found on ${pageUrl}.`).not.toHaveLength(0);

  const localHash = await perceptualHash(await readFile(resolvedAssetPath));
  let closestDistance = Number.POSITIVE_INFINITY;
  for (const imageUrl of imageUrls) {
    try {
      const imageResponse = await request.get(imageUrl, { timeout: 15000 });
      if (!imageResponse.ok()) {
        continue;
      }

      const distance = hammingDistance(
        localHash,
        await perceptualHash(await imageResponse.body()),
      );
      closestDistance = Math.min(closestDistance, distance);
    } catch {
      // Some page image URLs return malformed SVG/XML and are not hashable.
      continue;
    }
  }

  expect(
    closestDistance,
    `${imageName} was not found on ${pageUrl} within the pHash threshold of ${maxHashDistance}.`,
  ).toBeLessThanOrEqual(maxHashDistance);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}
