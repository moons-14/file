import { ResultType } from "../../types/result"

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

export type CD = {
    signature: number,
    versionMadeBy: number,
    versionNeededToExtract: number,
    bitFlag: number,
    compressionMethod: number,
    lastModTime: number,
    lastModDate: number,
    crc32: number,
    compressedSize: number,
    uncompressedSize: number,
    fileNameLength: number,
    extraFieldLength: number,
    fileCommentLength: number,
    diskNumberStart: number,
    internalFileAttributes: number,
    externalFileAttributes: number,
    relativeOffsetOfLocalHeader: number,
    fileName: Buffer,
    extraField?: Buffer,
    fileComment?: Buffer,
}

export const readEOCD = (buffer: Buffer): ResultType<{ eocd: EOCD }, "TOO_SHORT" | "TOO_LONG" | "INVALID_EOCD" | "INVALID_CENTRAL_DIR"> => {
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

export const readCD = (buffer: Buffer): ResultType<{ cd: CD }, "TOO_SHORT" | "TOO_LONG" | "INVALID_CENTRAL_DIR"> => {
    if (buffer.length < 46) {
        return { success: false, error: "TOO_SHORT" };
    }
    const maxCDLength = 46 + 3 * 0xffff;
    if (buffer.length > maxCDLength) {
        return { success: false, error: "TOO_LONG" };
    }

    const signature = buffer.readUInt32LE(0);
    if (signature !== 0x02014b50) {
        return { success: false, error: "INVALID_CENTRAL_DIR" };
    }

    let offset = 4;
    const versionMadeBy = buffer.readUInt16LE(offset);
    offset += 2;
    const versionNeededToExtract = buffer.readUInt16LE(offset);
    offset += 2;
    const bitFlag = buffer.readUInt16LE(offset);
    offset += 2;
    const compressionMethod = buffer.readUInt16LE(offset);
    offset += 2;
    const lastModTime = buffer.readUInt16LE(offset);
    offset += 2;
    const lastModDate = buffer.readUInt16LE(offset);
    offset += 2;
    const crc32 = buffer.readUInt32LE(offset);
    offset += 4;
    const compressedSize = buffer.readUInt32LE(offset);
    offset += 4;
    const uncompressedSize = buffer.readUInt32LE(offset);
    offset += 4;
    const fileNameLength = buffer.readUInt16LE(offset);
    offset += 2;
    const extraFieldLength = buffer.readUInt16LE(offset);
    offset += 2;
    const fileCommentLength = buffer.readUInt16LE(offset);
    offset += 2;
    const diskNumberStart = buffer.readUInt16LE(offset);
    offset += 2;
    const internalFileAttributes = buffer.readUInt16LE(offset);
    offset += 2;
    const externalFileAttributes = buffer.readUInt32LE(offset);
    offset += 4;
    const relativeOffsetOfLocalHeader = buffer.readUInt32LE(offset);
    offset += 4;

    // // バッファ長が、固定部 + 可変部（fileName, extraField, fileComment）の合計と一致するか確認
    // const expectedLength = 46 + fileNameLength + extraFieldLength + fileCommentLength;
    // console.log(buffer.length, expectedLength);
    // if (buffer.length !== expectedLength) {
    //     return { success: false, error: "INVALID_CENTRAL_DIR" };
    // }

    const fileName = buffer.slice(offset, offset + fileNameLength);
    offset += fileNameLength;

    let extraField: Buffer | undefined;
    if (extraFieldLength > 0) {
        extraField = buffer.slice(offset, offset + extraFieldLength);
        offset += extraFieldLength;
    }

    let fileComment: Buffer | undefined;
    if (fileCommentLength > 0) {
        fileComment = buffer.slice(offset, offset + fileCommentLength);
        offset += fileCommentLength;
    }

    const cd: CD = {
        signature,
        versionMadeBy,
        versionNeededToExtract,
        bitFlag,
        compressionMethod,
        lastModTime,
        lastModDate,
        crc32,
        compressedSize,
        uncompressedSize,
        fileNameLength,
        extraFieldLength,
        fileCommentLength,
        diskNumberStart,
        internalFileAttributes,
        externalFileAttributes,
        relativeOffsetOfLocalHeader,
        fileName,
        extraField,
        fileComment,
    };

    return { success: true, cd };
}


export const extractEOCD = (buffer: Buffer): ResultType<{ eocd: EOCD }, "INVALID_EOCD"> => {

    let eocdBuffer: Buffer;
    let eocd: EOCD | undefined;
    let eocdOffset = 0;
    let error: string | null = null;
    while (true) {
        try {
            eocdBuffer = buffer.slice(buffer.length - 22 - eocdOffset, buffer.length - eocdOffset);
            const result = readEOCD(eocdBuffer);
            if (result.success) {
                eocd = result.eocd;
            } else {
                error = result.error;
                break;
            }
        } catch (e) {
            error = "INVALID_EOCD";
            break;
        }
        eocdOffset++;
    }

    if (!eocd) {
        return {
            success: false,
            error: "INVALID_EOCD"
        }
    }

    return {
        success: true,
        eocd: eocd
    }
}