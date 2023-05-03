export type ShrinkImageFunction = (
  buffer: string | Uint8Array | ArrayBuffer
) => Promise<Uint8Array>;
