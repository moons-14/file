import fs from 'fs';
import { extractEOCD, readCD } from './parse/eocd';

const readZip = (buffer: Buffer) => {

    const eocd = extractEOCD(buffer);

    console.log('EOCD:', eocd);

    if(!eocd.success){
        console.error('Error reading EOCD:', eocd.error);
        return;
    }

    const cdOffset = eocd.eocd.offset;
    const cdSize = eocd.eocd.size;
    const cdBuffer = buffer.slice(cdOffset, cdOffset + cdSize);
    const cd = readCD(cdBuffer);

    console.log('CD:', cd);

    if(cd.success){
        // cd.fileNameはバイナリ　これを文字列にする
        const fileName = cd.cd.fileName.toString('utf-8');
        console.log('File Name:', fileName);
    }
};

const file = fs.readFileSync('files/example.zip');
readZip(file);