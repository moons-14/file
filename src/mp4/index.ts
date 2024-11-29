import fs from 'fs';
import { BoxData, BoxType, parseBox, readBox } from './parse';

const readMp4 = (buffer: Buffer) => {

    const bufferBoxes = readBox(buffer);

    const boxes: {
        length: number;
        type: BoxType;
        box: Buffer;
        data: BoxData
    }[] = [];

    for (const { type, box } of bufferBoxes) {
        console.log(`Box type: ${type}`);
        try {
            const data = parseBox(box, type);
            boxes.push({ length: box.length, type: type as BoxType, box, data });
        } catch (e) {
            console.error(`Error parsing box ${type}`);
            console.error(e);
        }
    }

    for (const { length, type, data } of boxes) {
        console.log(`Box type: ${type}`);
        console.log(`Length: ${length}`);
        console.log(data);
    }
};

const file = fs.readFileSync('files/example.mp4');
readMp4(file);