import React, { useState, useEffect } from 'react';
import { ImageOff, Maximize2, X, Sparkles } from 'lucide-react';
import { FALLBACK_FOOD_IMAGE } from '../lib/imageOptimization';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: '4/3' | '16/9' | '1/1' | '21/9' | 'auto';
  objectFit?: 'cover' | 'contain';
  allowZoom?: boolean;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'auto',
  objectFit = 'cover',
  allowZoom = false,
  loading = 'lazy',
  priority = false,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src || FALLBACK_FOOD_IMAGE);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Cập nhật khi prop src thay đổi
  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setHasError(false);
      setIsLoaded(false);
    } else {
      setCurrentSrc(FALLBACK_FOOD_IMAGE);
    }
  }, [src]);

  // Xử lý khi ảnh bị lỗi (404, CORS, die link)
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(FALLBACK_FOOD_IMAGE);
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (allowZoom) {
      e.stopPropagation();
      setIsZoomOpen(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  // Xác định class aspect ratio
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '4/3':
        return 'aspect-[4/3]';
      case '16/9':
        return 'aspect-[16/9]';
      case '21/9':
        return 'aspect-[21/9]';
      case '1/1':
        return 'aspect-square';
      default:
        return '';
    }
  };

  return (
    <>
      <div
        onClick={handleContainerClick}
        className={`relative overflow-hidden bg-[#F3EDE6] select-none ${getAspectClass()} ${containerClassName} ${
          allowZoom ? 'cursor-zoom-in group/zoom' : ''
        }`}
      >
        {/* Shimmer / Skeleton Loader */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#EDE6DE] via-[#F8F4EE] to-[#EDE6DE] bg-[length:200%_100%] animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-1.5 text-[#B5A595] opacity-60">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-[10px] font-semibold tracking-wider uppercase">Đang tải ảnh...</span>
            </div>
          </div>
        )}

        {/* Thẻ Image chính */}
        <img
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : loading}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full ${
            objectFit === 'contain' ? 'object-contain' : 'object-cover'
          } transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />

        {/* Fallback Error Indicator Badge nếu ảnh bị lỗi */}
        {hasError && (
          <div className="absolute top-2 right-2 bg-amber-900/70 backdrop-blur-xs text-amber-100 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1">
            <ImageOff className="w-3 h-3" />
            <span>Ảnh mẫu thay thế</span>
          </div>
        )}

        {/* Nút phóng to thu nhỏ nếu bật allowZoom */}
        {allowZoom && isLoaded && (
          <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 backdrop-blur-xs text-white opacity-0 group-hover/zoom:opacity-100 transition-opacity pointer-events-none">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomOpen(false);
          }}
        >
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Đóng xem ảnh"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentSrc}
              alt={alt}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="mt-3 text-center text-white/90">
              <p className="text-sm font-bold">{alt}</p>
              <p className="text-xs text-white/60 mt-0.5">Bấm bên ngoài hoặc nút X để đóng</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
