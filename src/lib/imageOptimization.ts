/**
 * Image Optimization Utilities
 * Cung cấp giải pháp nén ảnh thông minh tại trình duyệt (Client-side compression),
 * tự động cân đối kích thước, định dạng WebP/JPEG và giữ nguyên độ sắc nét của món ăn.
 */

export interface OptimizeOptions {
  maxDimension?: number; // Chiều dài hoặc rộng tối đa (mặc định: 1280px cho ảnh chính, 800px cho ảnh bước nấu)
  quality?: number;      // Chất lượng nén 0 - 1 (mặc định: 0.82, cân bằng tuyệt hảo giữa dung lượng và độ nét)
  format?: 'webp' | 'jpeg' | 'auto'; // Định dạng xuất
}

export interface OptimizeResult {
  dataUrl: string;
  blob: Blob;
  fileName: string;
  originalSize: number;     // Kích thước ban đầu (bytes)
  optimizedSize: number;    // Kích thước sau nén (bytes)
  savedBytes: number;       // Số byte tiết kiệm được
  reductionPercent: number; // Tỷ lệ giảm (ví dụ: 92 nghĩa là giảm 92%)
  width: number;
  height: number;
  format: 'webp' | 'jpeg';
}

/**
 * Định dạng số bytes thành chuỗi dễ đọc (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Kiểm tra tệp có phải là định dạng hình ảnh được hỗ trợ không
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Không tìm thấy tệp được chọn.' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/avif', 'image/heic', 'image/heif'];
  const isImageMime = file.type.startsWith('image/') || validTypes.includes(file.type.toLowerCase());
  
  // Kiểm tra đuôi mở rộng phòng trường hợp MIME type bị thiếu
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic', 'heif'];
  const hasValidExt = validExtensions.includes(ext);

  if (!isImageMime && !hasValidExt) {
    return {
      valid: false,
      error: 'Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP, GIF, HEIC).'
    };
  }

  // Cảnh báo nếu file quá lớn (> 25MB)
  if (file.size > 25 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Tệp hình ảnh quá lớn (> 25MB). Vui lòng chọn ảnh nhẹ hơn để đảm bảo tốc độ.'
    };
  }

  return { valid: true };
}

/**
 * Tối ưu hóa ảnh từ File (nén, đổi kích thước, chuyển sang WebP/JPEG)
 */
export async function optimizeImageFile(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const {
    maxDimension = 1280,
    quality = 0.82,
    format = 'auto'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Không thể đọc tệp từ thiết bị của bạn.'));
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Định dạng ảnh không được hỗ trợ hoặc tệp ảnh bị hỏng.'));
      };

      img.onload = async () => {
        try {
          let { width, height } = img;

          // Tính toán kích thước mới giữ nguyên tỷ lệ khung hình
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          // Vẽ lên canvas để nén
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            // Fallback nếu không lấy được context
            const fallbackDataUrl = e.target?.result as string;
            return resolve({
              dataUrl: fallbackDataUrl,
              blob: file,
              fileName: file.name,
              originalSize: file.size,
              optimizedSize: file.size,
              savedBytes: 0,
              reductionPercent: 0,
              width: img.width,
              height: img.height,
              format: 'jpeg'
            });
          }

          // Tăng chất lượng làm mịn ảnh khi resize
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Tô nền trắng nhẹ phòng trường hợp PNG trong suốt chuyển sang JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          // Kiểm tra hỗ trợ WebP của trình duyệt
          let targetFormat: 'webp' | 'jpeg' = 'jpeg';
          let mimeType = 'image/jpeg';

          if (format === 'webp' || format === 'auto') {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 1;
            testCanvas.height = 1;
            const webpSupport = testCanvas.toDataURL('image/webp').startsWith('data:image/webp');
            if (webpSupport) {
              targetFormat = 'webp';
              mimeType = 'image/webp';
            }
          }

          // Tạo Blob tối ưu
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback nếu toBlob trả về null
                const fallbackDataUrl = canvas.toDataURL(mimeType, quality);
                const approxSize = Math.round((fallbackDataUrl.length * 3) / 4);
                const reduction = Math.max(0, Math.round(((file.size - approxSize) / file.size) * 100));
                return resolve({
                  dataUrl: fallbackDataUrl,
                  blob: file,
                  fileName: file.name,
                  originalSize: file.size,
                  optimizedSize: approxSize,
                  savedBytes: Math.max(0, file.size - approxSize),
                  reductionPercent: reduction,
                  width,
                  height,
                  format: targetFormat
                });
              }

              const readerBlob = new FileReader();
              readerBlob.onloadend = () => {
                const dataUrl = readerBlob.result as string;
                const optimizedSize = blob.size;
                const savedBytes = Math.max(0, file.size - optimizedSize);
                const reductionPercent = Math.max(0, Math.round((savedBytes / file.size) * 100));

                resolve({
                  dataUrl,
                  blob,
                  fileName: file.name.replace(/\.[^/.]+$/, `.${targetFormat}`),
                  originalSize: file.size,
                  optimizedSize,
                  savedBytes,
                  reductionPercent,
                  width,
                  height,
                  format: targetFormat
                });
              };
              readerBlob.readAsDataURL(blob);
            },
            mimeType,
            quality
          );
        } catch (err: any) {
          reject(new Error(`Lỗi trong quá trình tối ưu ảnh: ${err.message}`));
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Danh sách ảnh món ăn Việt Nam chất lượng cao dùng làm Fallback khi ảnh bị lỗi / trống
 */
export const DEFAULT_FOOD_PLACEHOLDERS = [
  {
    category: 'man',
    title: 'Phở Bò Truyền Thống',
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80'
  },
  {
    category: 'chay',
    title: 'Đậu Hũ Xào Nấm Rau Củ',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    category: 'canh',
    title: 'Canh Chua Thanh Mát',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80'
  },
  {
    category: 'kho',
    title: 'Thịt Kho Đậm Đà',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'
  },
  {
    category: 'lau',
    title: 'Lẩu Gia Đình Ấm Cúng',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80'
  }
];

export const FALLBACK_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';

/**
 * Lấy ảnh món ăn dự phòng ngẫu nhiên
 */
export function getRandomFoodPlaceholder(): string {
  const idx = Math.floor(Math.random() * DEFAULT_FOOD_PLACEHOLDERS.length);
  return DEFAULT_FOOD_PLACEHOLDERS[idx].url;
}
