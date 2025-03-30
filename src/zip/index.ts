import fs from 'fs';
import { extractEOCD } from './parse/eocd';

const readZip = (buffer: Buffer) => {

    const eocd = extractEOCD(buffer);

    console.log('EOCD:', eocd);
};

const file = fs.readFileSync('files/example.zip');
readZip(file);