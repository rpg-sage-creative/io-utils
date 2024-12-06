import { type Optional } from "@rsc-utils/core-utils";
type ImageType = "gif" | "jpeg" | "png" | "webp";
export type ImageMetadata = {
    height: number;
    size: number;
    type: ImageType;
    width: number;
};
export declare function bufferToMetadata(buffer: Optional<Buffer>): ImageMetadata | undefined;
export {};
