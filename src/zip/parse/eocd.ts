export type EOCD = {
    signature: number,
    diskNumber: number,
    startDiskNumber: number,
    diskEntries: number,
    totalDiskEntries: number,
    size: number,
    offset: number,
    commentLength: number,
    comment?: Buffer,
}

export const readEOCD = (buffer: Buffer): {
    success: boolean,
    error?: "TOO_SHORT" | "TOO_LONG" | "INVALID_EOCD" | "INVALID_CENTRAL_DIR",
    eocd?: EOCD
} => {
    if (buffer.length < 22) {
        return {
            success: false,
            error: "TOO_SHORT"
        }
    }
    if (buffer.length > 0xffff + 22) {
        return {
            success: false,
            error: "TOO_LONG"
        }
    }

    const signature = buffer.readUInt32LE(0);
    if (signature !== 0x06054b50) {
        return { success: false, error: "INVALID_EOCD" };
    }

    try {
        const diskNumber = buffer.readUInt16LE(4);
        const startDiskNumber = buffer.readUInt16LE(6);
        const diskEntries = buffer.readUInt16LE(8);
        const totalDiskEntries = buffer.readUInt16LE(10);
        const size = buffer.readUInt32LE(12);
        const offset = buffer.readUInt32LE(16);
        const commentLength = buffer.readUInt16LE(20);


        if (buffer.length !== 22 + commentLength) {
            return { success: false, error: "INVALID_EOCD" };
        }

        const comment = buffer.slice(22, 22 + commentLength);
        const eocd: EOCD = {
            signature,
            diskNumber,
            startDiskNumber,
            diskEntries,
            totalDiskEntries,
            size,
            offset,
            commentLength,
            comment: commentLength > 0 ? comment : undefined,
        };

        return { success: true, eocd };
    } catch (error) {
        return { success: false, error: "INVALID_EOCD" };
    }
}

export const extractEOCD = (buffer: Buffer): EOCD => {
    // 後ろから探索する
    // 0x06054b50がヒットしたらそれを含めた後ろのバッファーを取得

    let eocdBuffer: Buffer;
    let eocd: EOCD | undefined;
    let eocdOffset = 0;
    while (true) {
        try {
            eocdBuffer = buffer.slice(buffer.length - 22 - eocdOffset, buffer.length - eocdOffset);
            const result = readEOCD(eocdBuffer);
            if (result.success) {
                eocd = result.eocd;
                break;
            }
        } catch (e) {
            throw new Error("Invalid EOCD");
        }
        eocdOffset++;
    }

    if (!eocd) {
        throw new Error("Invalid EOCD");
    }

    return eocd;
}