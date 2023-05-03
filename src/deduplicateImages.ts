import {
  PDFDocument,
  PDFName,
  PDFRef,
  PDFPage,
  PDFDict,
  PDFObject,
  PDFStream,
} from 'pdf-lib';

/**
 * Return the page > node > Resources > xObject of a PDFPage
 * where are (apparently) stored all the images of the page
 */
function getPageXObject(page: PDFPage): PDFDict | null {
  const resources = page.node.get(PDFName.of('Resources'));

  if (!(resources instanceof PDFDict)) {
    return null;
  }

  const xObject = resources.get(PDFName.of('XObject'));
  if (!(xObject instanceof PDFDict)) {
    return null;
  }

  return xObject;
}

/**
 * Get the page of a PDFDocument that contains a given image.
 */
function findPageForImageRef(
  pdfDoc: PDFDocument,
  imageRef: PDFRef
): PDFPage | undefined {
  return pdfDoc.getPages().find((page) => {
    const xObject = getPageXObject(page);

    if (!(xObject instanceof PDFDict)) {
      return false;
    }

    return !!xObject.get(PDFName.of(`X${imageRef.objectNumber}`));
  });
}

type DuplicatedImageMapValue = {
  object: PDFObject;
  refs: Array<PDFRef>;
};

type DuplicatedImageMap = Map<string, DuplicatedImageMapValue>;

/**
 * Extract all big images from a PDFDocument
 */
function findDocumentImages(pdfDoc: PDFDocument): Array<[PDFRef, PDFStream]> {
  return pdfDoc.context
    .enumerateIndirectObjects()
    .filter<[PDFRef, PDFStream]>(
      (
        indirectObject: [PDFRef, PDFObject]
      ): indirectObject is [PDFRef, PDFStream] => {
        const [, object] = indirectObject;

        if (!(object instanceof PDFStream)) {
          return false;
        }

        const subtype = object.dict.get(PDFName.of('Subtype'));

        if (object.sizeInBytes() < 10_000) {
          // TODO temporary expclude small images (unknown what they are)
          return false;
        }

        return subtype === PDFName.of('Image');
      }
    );
}

/**
 * Find all duplicated images in a list of objects
 */
function findAllDuplicatedImages(
  allIndirectObjects: Array<[PDFRef, PDFStream]>
): DuplicatedImageMap {
  return allIndirectObjects.reduce((carry, [ref, object]) => {
    const key = object.toString();
    if (carry.has(key)) {
      carry.get(key)?.refs.push(ref);
    } else {
      carry.set(key, { object, refs: [ref] });
    }

    return carry;
  }, new Map<string, DuplicatedImageMapValue>());
}

export async function deduplicatePdfImage(
  buffer: string | Uint8Array | ArrayBuffer
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.load(buffer);

  const allIndirectObjects = findDocumentImages(pdfDoc);

  const duplicatedObjects = findAllDuplicatedImages(allIndirectObjects);

  duplicatedObjects.forEach(async (object) => {
    const { refs } = object;

    const [firstRef, ...rest] = refs;

    // replace all references to the image with the background
    rest.forEach((ref) => {
      const page = findPageForImageRef(pdfDoc, ref);

      if (!page) {
        return;
      }

      const xObject = getPageXObject(page);
      if (!xObject) {
        return;
      }

      xObject.set(PDFName.of(`X${ref.objectNumber}`), firstRef);

      pdfDoc.context.delete(ref);
    });
  });

  return pdfDoc;
}
