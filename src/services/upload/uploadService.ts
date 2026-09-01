import * as ImagePicker from 'expo-image-picker';

import { env } from '@/app/config/env';
import { getAccessToken } from '@/services/storage/tokenStorage';

export type SalonImageFolder = 'covers' | 'logos' | 'gallery';

export interface UploadResult {
  success: boolean;
  url: string;
  path: string;
  filename: string;
}

export interface SignedUrlResult {
  success: boolean;
  signedUrl: string;
  expiresIn: number;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export class UploadValidationError extends Error {}

/** Launches the native image picker (single image, no crop editing). Returns null if the user cancels. */
export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new UploadValidationError('Photo library access is required to select an image.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}

/** Launches the native document/image picker for the agreement document. Returns null if the user cancels. */
export async function pickDocument(): Promise<ImagePicker.ImagePickerAsset | null> {
  return pickImage();
}

function guessMimeType(asset: ImagePicker.ImagePickerAsset): string {
  if (asset.mimeType) return asset.mimeType;
  const ext = (asset.fileName ?? asset.uri).split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'pdf') return 'application/pdf';
  return 'image/jpeg';
}

function guessFileName(asset: ImagePicker.ImagePickerAsset, mimeType: string): string {
  if (asset.fileName) return asset.fileName;
  const ext = mimeType.split('/')[1] ?? 'jpg';
  return `upload-${Date.now()}.${ext}`;
}

async function multipartUpload<T>(path: string, asset: ImagePicker.ImagePickerAsset): Promise<T> {
  const token = await getAccessToken();
  const mimeType = guessMimeType(asset);
  const fileName = guessFileName(asset, mimeType);

  const formData = new FormData();
  // React Native's fetch accepts this shape for a file part; it is not a real Blob.
  formData.append('file', {
    uri: asset.uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    let detail = `Upload failed with status ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

/** Uploads a salon image (cover/logo/gallery) to `/api/v1/upload/salon-image`. */
export async function uploadSalonImage(
  asset: ImagePicker.ImagePickerAsset,
  folder: SalonImageFolder,
): Promise<UploadResult> {
  const mimeType = guessMimeType(asset);
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new UploadValidationError('Only JPEG, PNG, or WebP images are allowed.');
  }
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
    throw new UploadValidationError('Image is too large. Maximum size is 5MB.');
  }

  return multipartUpload<UploadResult>(`/api/v1/upload/salon-image?folder=${folder}`, asset);
}

/** Uploads the salon agreement document to `/api/v1/upload/agreement-document`. */
export async function uploadAgreementDocument(
  asset: ImagePicker.ImagePickerAsset,
): Promise<UploadResult> {
  const mimeType = guessMimeType(asset);
  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(mimeType)) {
    throw new UploadValidationError('Only PDF, JPEG, PNG, or WebP files are allowed.');
  }
  if (asset.fileSize && asset.fileSize > MAX_DOCUMENT_BYTES) {
    throw new UploadValidationError('Document is too large. Maximum size is 10MB.');
  }

  return multipartUpload<UploadResult>('/api/v1/upload/agreement-document', asset);
}

/** Fetches a time-limited signed URL for viewing a private agreement document. */
export async function getAgreementDocumentSignedUrl(path: string): Promise<SignedUrlResult> {
  const token = await getAccessToken();
  const response = await fetch(
    `${env.apiBaseUrl}/api/v1/upload/agreement-document/signed-url?path=${encodeURIComponent(path)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
  );

  if (!response.ok) {
    let detail = `Failed to load document with status ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json() as Promise<SignedUrlResult>;
}
