export type MvhdBox = {
    flags: number;
    version: number;
    creationTime: number;
    modificationTime: number;
    timeScale: number;
    duration: number;
    rate: number;
    volume: number;
    matrix: number[];
    previewTime: number;
    previewDuration: number;
    posterTime: number;
    selectionTime: number;
    selectionDuration: number;
    currentTime: number;
    nextTrackId: number;
}

export const mvhdBox = (buffer: Buffer): MvhdBox => {
    const version = buffer.readUInt8(0);
    const flags = buffer.readUIntBE(1, 3);
    let offset = 4;
    let creationTime, modificationTime, timeScale, duration;
    if (version === 1) {
        creationTime = buffer.readBigUInt64BE(offset);
        modificationTime = buffer.readBigUInt64BE(offset + 8);
        timeScale = buffer.readUInt32BE(offset + 16);
        duration = buffer.readBigUInt64BE(offset + 20);
        offset += 28;
    } else {
        creationTime = buffer.readUInt32BE(offset);
        modificationTime = buffer.readUInt32BE(offset + 4);
        timeScale = buffer.readUInt32BE(offset + 8);
        duration = buffer.readUInt32BE(offset + 12);
        offset += 16;
    }
    const rate = buffer.readUInt16BE(offset) + buffer.readUInt16BE(offset + 2) / 0x10000;
    const volume = buffer.readUInt8(offset + 4) + buffer.readUInt8(offset + 5) / 0x100;
    const matrix: number[] = [];
    for (let i = 0; i < 9; i++) {
        matrix.push(buffer.readUInt32BE(offset + 6 + i * 4));
    }
    const previewTime = buffer.readUInt32BE(offset + 42);
    const previewDuration = buffer.readUInt32BE(offset + 46);
    const posterTime = buffer.readUInt32BE(offset + 50);
    const selectionTime = buffer.readUInt32BE(offset + 54);
    const selectionDuration = buffer.readUInt32BE(offset + 58);
    const currentTime = buffer.readUInt32BE(offset + 62);
    const nextTrackId = buffer.readUInt32BE(offset + 66);

    return {
        flags,
        version,
        creationTime,
        modificationTime,
        timeScale,
        duration,
        rate,
        volume,
        matrix,
        previewTime,
        previewDuration,
        posterTime,
        selectionTime,
        selectionDuration,
        currentTime,
        nextTrackId
    };
}