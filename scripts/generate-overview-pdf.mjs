import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../docs/servicehub-backend-overview.md', import.meta.url), 'utf8');
const ascii = source
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/[—–]/g, '-')
  .replace(/→/g, '->')
  .replace(/[^\x20-\x7E\n\r\t]/g, '');

function wrap(line, width = 92) {
  const words = line.trim().split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (!word) continue;
    if (current && current.length + word.length + 1 > width) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

const lines = ascii.split(/\r?\n/).flatMap((line) => {
  const clean = line.replace(/^#+\s*/, '').replace(/^-\s*/, '- ');
  return wrap(clean);
});
const pageLines = 52;
const pages = [];
for (let i = 0; i < lines.length; i += pageLines) pages.push(lines.slice(i, i + pageLines));

const objects = [];
function addObject(body) {
  objects.push(body);
  return objects.length;
}

const catalogId = addObject('');
const pagesId = addObject('');
const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
const pageIds = [];

for (const page of pages) {
  const pageId = objects.length + 1;
  const streamId = pageId + 1;
  pageIds.push(pageId);
  const commands = ['BT', '/F1 10 Tf', '48 790 Td', '13 TL'];
  for (const line of page) {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    commands.push(`(${escaped}) Tj`, 'T*');
  }
  commands.push('ET');
  const stream = commands.join('\n');
  addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${streamId} 0 R >>`);
  addObject(`<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`);
}

objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

let pdf = '%PDF-1.4\n';
const offsets = [0];
for (let i = 0; i < objects.length; i += 1) {
  offsets.push(Buffer.byteLength(pdf, 'ascii'));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}
const xrefOffset = Buffer.byteLength(pdf, 'ascii');
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

await writeFile(new URL('../docs/ServiceHub-Backend-Overview.pdf', import.meta.url), Buffer.from(pdf, 'ascii'));
console.log(`Created docs/ServiceHub-Backend-Overview.pdf (${pages.length} pages).`);
