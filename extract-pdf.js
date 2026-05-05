import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const data = new Uint8Array(fs.readFileSync('1-ANTEPRIMA.pdf'));

getDocument({ data }).promise.then(async (pdf) => {
  let text = '';
  for(let i=1;i<=pdf.numPages;i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(' ');
    text += '\n';
  }
  fs.writeFileSync('pdf_extracted.txt', text);
  console.log('Done, extracted ' + text.length + ' characters.');
}).catch(console.error);
