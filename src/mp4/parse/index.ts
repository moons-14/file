import * as parser from "./box";

export const readBox = (buffer: Buffer) => {
    const bufferBoxes: {
        length: number;
        type: string;
        box: Buffer;
    }[] = [];
    let offset = 0;

    while (offset < buffer.length) {
        let length = buffer.readUInt32BE(offset);
        let type = buffer.toString('ascii', offset + 4, offset + 8);
        if (length === 1) {
            length = Number(buffer.readBigUInt64BE(offset + 8));
            const box = buffer.subarray(offset + 16, offset + length);
            bufferBoxes.push({ length, type, box });
            offset += length;
        } else {
            const box = buffer.subarray(offset + 8, offset + length);
            bufferBoxes.push({ length, type, box });
            offset += length;
        }
    }

    return bufferBoxes;
};

export type BoxType = "ftyp" | "moov" | "mvhd";

export type BoxData = parser.FtypBox | parser.MoovBox | parser.MvhdBox;

export const parseBox = (buffer: Buffer, boxType: BoxType | string): BoxData => {
    const type: BoxType = boxType as BoxType;
    switch (type) {
        case "ftyp":
            return parser.ftypBox(buffer);
        case "moov":
            return parser.moovBox(buffer);
        case "mvhd":
            return parser.mvhdBox(buffer);
        default:
            throw new Error(`Unknown box type: ${type}`);
    }
};