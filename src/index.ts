import { deduplicatePdfImage } from './deduplicateImages.js';
import type { ShrinkImageFunction } from './types.js';

const shrinkPdf: ShrinkImageFunction = async (buffer) => {
  const deduplicatedPdf = await deduplicatePdfImage(buffer);

  const savedPdf = await deduplicatedPdf.save();

  return savedPdf;
};

export default shrinkPdf;
