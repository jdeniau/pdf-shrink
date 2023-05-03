# pdf-shrink

Pure JS PDF shrink tool.

It does use [pdf-lib](https://pdf-lib.js.org/) internally.

## Installation

```sh
npm install pdf-shrink
```

## Usage

### With a puppeteer generated pdf

```ts
import puppeteer from 'puppeteer';
import shrinkPdf from 'pdf-shrink';

function generatePdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  const pdfDoc = await page.pdf();

  const optimizedPdf = await shrinkPdf(pdfDoc);

  return Buffer.from(savedWithoutImage);
}
```

## What does this package really do ?

For now, it does only remove images that are duplicated in the PDF.

The example is with pupepeteer as chromium does now de-duplicate images and will generate a huge PDF file when images are duplicated.
