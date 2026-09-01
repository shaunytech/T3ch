 Image Region Mapping Tests

A Playwright-based test framework that validates Xbox region-specific images across different geographies using perceptual hashing and data mapping validation.

## Project Overview

This project demonstrates:
- **JSON vs CSV Validation**: 1-to-1 comparison testing to ensure mapping data consistency
- **Perceptual Hash Utility**: Converts images to hash codes for robust image comparison
- **Regional Image Validation**: Verifies that Xbox web pages display the correct region-specific images

## Test Architecture

### 1. Data Mapping Validation

The test framework uses two equivalent data formats to define image-region mappings:

**CSV Format** (`test-data/image_regions.csv`):
```csv
image,region
xbox white,US
xbox green,UK
xbox green,JP
nintendo,FR
nintendo,DE
```

**JSON Format** (`test-data/image_regions.json`):
```json
[
  { "image": "xbox white", "region": "US" },
  { "image": "xbox green", "region": "UK" },
  { "image": "xbox green", "region": "JP" },
  { "image": "nintendo", "region": "FR" },
  { "image": "nintendo", "region": "DE" }
]
```

**Test**: The framework includes a dedicated test that validates these two data sources contain identical mappings. This ensures consistency across different data formats and prevents divergence.

### 2. Perceptual Hash Utility

Located in `tests/utils/perceptual-hash.ts`, this utility provides:

#### `perceptualHash(image: Buffer): Promise<string>`
Converts image files to perceptual hash codes using Discrete Cosine Transform (DCT):
- Resizes image to 32×32 pixels
- Converts to grayscale
- Computes 8×8 DCT coefficients
- Generates a 63-bit binary hash string
- Results are robust to minor image variations (compression, scaling, color adjustments)

#### `hammingDistance(left: string, right: string): number`
Calculates the Hamming distance between two hash strings:
- Counts the number of differing bits
- Used to determine if images are perceptually similar
- Default threshold: 10 bits of difference allowed

### 3. Xbox Regional Image Validation

The test framework validates that Xbox web pages display the correct region-specific images:

| Region | Image | Color | URL |
|--------|-------|-------|-----|
| **US** | xbox white | White | `https://www.xbox.com/en-US/` |
| **UK** | xbox green | Green | `https://www.xbox.com/en-GB/` |
| **JP** | xbox green | Green | `https://www.xbox.com/ja-JP/` |

**Test Flow**:
1. Navigate to the region-specific Xbox web page
2. Extract all image URLs from the page
3. Download each image from the page
4. Generate perceptual hashes for:
   - Local reference image (from `test-data/assets/`)
   - Downloaded page images
5. Compare hashes using Hamming distance
6. Verify the closest match is within the acceptable threshold

## Test Execution

Run the image mapping tests:
```bash
npm run test:image-mapping
```

### Environment Variables

Customize test behavior with environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `IMAGE_MAPPING_CSV` | `test-data/image_regions.csv` | Path to CSV mappings |
| `IMAGE_MAPPING_JSON` | `test-data/image_regions.json` | Path to JSON mappings |
| `IMAGE_MAPPING_JSON_URL` | *(none)* | URL to fetch JSON mappings (overrides local path) |
| `IMAGE_HASH_MAX_DISTANCE` | `10` | Max Hamming distance for image similarity |
| `XBOX_US_ASSET` | `test-data/assets/xbox-white.png` | White Xbox reference image |
| `XBOX_UK_ASSET` | `test-data/assets/xbox-green.png` | Green Xbox reference image (UK) |
| `XBOX_JAPAN_ASSET` | `test-data/assets/xbox-green.png` | Green Xbox reference image (Japan) |

**Example**:
```bash
IMAGE_HASH_MAX_DISTANCE=5 npm run test:image-mapping
```

## Test Failure Conditions

The test suite will fail if:

1. **Mapping Inconsistency**: CSV and JSON files contain different image-region pairs
   - This prevents deployment of conflicting data

2. **Missing Reference Assets**: Required Xbox image files don't exist at specified paths
   - Tests are skipped with a clear error message until assets are provided

3. **Region Image Mismatch**: The page displays an image that doesn't match the expected regional variant
   - This indicates incorrect image serving or configuration
   - ✅ **US must show white Xbox image** - test fails if green Xbox is found
   - ✅ **UK must show green Xbox image** - test fails if white Xbox is found
   - ✅ **JP must show green Xbox image** - test fails if white Xbox is found

4. **Perceptual Hash Distance Exceeded**: Downloaded images differ too much from reference images
   - Indicates potential image corruption, format changes, or CDN issues

## Test Data Structure

```
test-data/
├── image_regions.csv           # CSV format mappings
├── image_regions.json          # JSON format mappings
├── image-mapping.csv           # Alternative CSV name
├── image-mapping.example.json  # Example JSON structure
├── image-references.example.json
├── xbox-image-references.example.json
└── assets/
    ├── xbox-white.png         # Reference white Xbox image (US)
    └── xbox-green.png         # Reference green Xbox image (UK/JP)
```

## Key Features

### Robust Image Comparison
- **Perceptual hashing** tolerates minor differences (compression, resizing, color shifts)
- **Configurable threshold** allows tuning sensitivity
- **Hamming distance** provides quantifiable image similarity metrics

### Data Consistency Validation
- **Dual-format validation** ensures mappings stay synchronized
- **Prevents config drift** between different systems or data pipelines
- **Fails fast** if inconsistencies are introduced

### Regional Coverage
- Tests validate all region-specific pages independently
- Each region uses expected image variant (white for US, green for UK/JP)
- Failure in one region doesn't prevent testing others

## Dependencies

- `@playwright/test`: Browser automation and test framework
- `sharp`: Image processing and resizing
- `csv-parse`: CSV parsing and validation
- `@types/node`: Node.js type definitions

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Add reference images to `test-data/assets/`:
   - `xbox-white.png` (US region reference)
   - `xbox-green.png` (UK/JP region reference)
4. Run tests: `npm run test:image-mapping`

## Notes

- The perceptual hash algorithm is deterministic - the same image always produces the same hash
- Hash distance threshold of 10 provides good tolerance for real-world image variations
- Tests require internet connectivity to fetch images from xbox.com
- Image URLs are deduplicated to avoid redundant processing
- The test gracefully handles malformed SVG/XML that cannot be hashed

## Documentation

Professional recommendations and career documentation:

- [Documentation Index](docs/DOCUMENTATION_INDEX.md) - Links to all professional documentation
  - [Letters of Recommendation](docs/letters-of-recommendation/) - Professional endorsements from QA managers, product owners, and engineers
  - [LinkedIn Recommendations](docs/letters-of-recommendation/linkedin-recommendations.md) - Professional recommendations from colleagues

These documents are provided for professional reference and are not part of the test framework.
