import { deduplicatePdfImage } from './deduplicateImages.js';
import type { ShrinkImageFunction } from './types.js';

const shrinkPdf: ShrinkImageFunction = deduplicatePdfImage;

export default shrinkPdf;
