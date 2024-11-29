export type FtypBox = {
    majorBrand: string;
    minorVersion: number;
    compatibleBrands: string[];
}

export const ftypBox = (buffer: Buffer): FtypBox => {
    const majorBrand = buffer.toString('ascii', 0, 4);
    const minorVersion = buffer.readUInt32BE(4);
    const compatibleBrands: string[] = [];
    let offset = 8;
    while (offset < buffer.length) {
        compatibleBrands.push(buffer.toString('ascii', offset, offset + 4));
        offset += 4;
    }
    return {
        majorBrand,
        minorVersion,
        compatibleBrands
    };
};