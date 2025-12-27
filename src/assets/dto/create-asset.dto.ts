// assets/dto/create-asset.dto.ts
// Data transfer object for creating assets

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
  folder?: string;        // Optional: custom folder name (e.g., 'profile-images')
  customFileName?: string; // Optional: custom filename (e.g., 'avatar.jpg')
}

export const validateUploadUrlRequest = (dto: UploadUrlRequestDto): string | null => {
  if (!dto.fileName || !dto.fileName.trim()) {
    return 'File name is required';
  }

  if (!dto.fileType || !dto.fileType.trim()) {
    return 'File type is required';
  }

  if (!dto.fileSize || dto.fileSize <= 0) {
    return 'File size must be greater than 0';
  }

  return null;
};

export const validateCreateAsset = (dto: CreateAssetDto): string | null => {
  if (!dto.fileName || !dto.fileName.trim()) {
    return 'File name is required';
  }

  if (!dto.fileType || !dto.fileType.trim()) {
    return 'File type is required';
  }

  if (!dto.fileSize || dto.fileSize <= 0) {
    return 'File size must be greater than 0';
  }

  return null;
};
