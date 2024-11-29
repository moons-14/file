import { readBox } from "..";
import { mvhdBox, MvhdBox } from "./mvhd"

export type MoovBox = {
    mvhd: MvhdBox;
}

export const moovBox = (buffer: Buffer): MoovBox => {
    const boxes = readBox(buffer);
    
    let mvhd: MvhdBox | undefined;

    for (const { type, box } of boxes) {
        switch (type) {
            case "mvhd":
                mvhd = mvhdBox(box);
                break;
        }
    }

    if (!mvhd) {
        throw new Error("mvhd box not found");
    }

    return {
        mvhd
    };
}