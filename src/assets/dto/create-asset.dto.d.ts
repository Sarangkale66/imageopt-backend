export interface CreateAssetDto {
    fileName: string;
    fileType: string;
    fileSize: number;
    metadata?: {
        width?: number;
        height?: number;
        format?: string;
    };
}
export interface UploadUrlRequestDto {
    fileName: string;
    fileType: string;
    fileSize: number;
    folder?: string;
    customFileName?: string;
}
export declare const validateUploadUrlRequest: (dto: UploadUrlRequestDto) => string | null;
export declare const validateCreateAsset: (dto: CreateAssetDto) => string | null;
