import { PDFDocument } from 'pdf-lib';

export type ShrinkImageFunction = (
  buffer: string | Uint8Array | ArrayBuffer
) => Promise<PDFDocument>;
