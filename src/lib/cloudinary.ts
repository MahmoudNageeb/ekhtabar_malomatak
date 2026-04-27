import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function ensureConfig() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('❌ بيانات Cloudinary غير مكتملة. أضف CLOUDINARY_CLOUD_NAME و CLOUDINARY_API_KEY و CLOUDINARY_API_SECRET في متغيرات البيئة.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  configured = true;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * يرفع صورة إلى Cloudinary من Buffer أو Base64 أو URL
 */
export async function uploadImage(input: Buffer | string, folder = 'ekhtabar_malomatak'): Promise<UploadResult> {
  ensureConfig();

  let dataUri: string;
  if (Buffer.isBuffer(input)) {
    dataUri = `data:image/jpeg;base64,${input.toString('base64')}`;
  } else {
    dataUri = input;
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' }
    ]
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes
  };
}

/**
 * حذف صورة من Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  ensureConfig();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.error('Cloudinary delete error:', e);
  }
}

/**
 * يستخرج public_id من رابط Cloudinary
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z]+$/i);
  return match ? match[1] : null;
}

export default cloudinary;
