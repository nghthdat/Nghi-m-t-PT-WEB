import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  Link2, 
  Sparkles, 
  AlertCircle,
  FileImage,
  Layers,
  ArrowDownRight
} from 'lucide-react';
import { 
  optimizeImageFile, 
  formatFileSize, 
  DEFAULT_FOOD_PLACEHOLDERS, 
  OptimizeResult 
} from '../lib/imageOptimization';

interface ImageUploadDropzoneProps {
  value?: string;
  onChange: (
    url: string, 
    stats?: { 
      originalSize?: number; 
      optimizedSize?: number; 
      reductionPercent?: number; 
      fileName?: string 
    }
  ) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: '4/3' | '16/9' | '1/1';
  maxDimension?: number;
  quality?: number;
  showPresets?: boolean;
  allowUrlInput?: boolean;
  className?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  value,
  onChange,
  label = 'Hình ảnh món ăn',
  helperText = 'Tải ảnh trực tiếp từ máy tính/điện thoại (JPG, PNG, WebP, HEIC). Tự động nén tối ưu dung lượng.',
  aspectRatio = '4/3',
  maxDimension = 1280,
  quality = 0.82,
  showPresets = true,
  allowUrlInput = true,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    optimizedSize: number;
    reductionPercent: number;
    fileName: string;
    format: string;
  } | null>(null);
  const [customUrl, setCustomUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Xử lý nén và tải ảnh từ File
  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const result: OptimizeResult = await optimizeImageFile(file, {
        maxDimension,
        quality,
        format: 'auto'
      });

      setCompressionStats({
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        reductionPercent: result.reductionPercent,
        fileName: result.fileName,
        format: result.format.toUpperCase()
      });

      onChange(result.dataUrl, {
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        reductionPercent: result.reductionPercent,
        fileName: result.fileName
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xử lý hình ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  // Bắt sự kiện chọn file từ input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Reset file input để có thể chọn lại cùng file
    if (e.target) {
      e.target.value = '';
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Bắt sự kiện Paste từ Clipboard (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessFile(file);
            break;
          }
        }
      }
    };

    const dropEl = dropzoneRef.current;
    if (dropEl) {
      dropEl.addEventListener('paste', handlePaste);
      return () => dropEl.removeEventListener('paste', handlePaste);
    }
  }, [maxDimension, quality]);

  const handleRemoveImage = () => {
    onChange('');
    setCompressionStats(null);
    setErrorMessage(null);
    setCustomUrl('');
  };

  const handleSelectPreset = (url: string) => {
    setCompressionStats(null);
    setErrorMessage(null);
    onChange(url);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setCompressionStats(null);
    setErrorMessage(null);
    onChange(customUrl.trim());
  };

  const getAspectStyle = () => {
    switch (aspectRatio) {
      case '16/9':
        return 'aspect-[16/9]';
      case '1/1':
        return 'aspect-square';
      default:
        return 'aspect-[4/3]';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header with Title & Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {label && (
            <label className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
              <FileImage className="w-3.5 h-3.5 text-[#a33e07]" />
              {label}
            </label>
          )}
          {helperText && (
            <p className="text-[11px] text-[#7A6B5D] mt-0.5">{helperText}</p>
          )}
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#F5EDE4] p-1 rounded-xl border border-[#EAE0D5] text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-[#a33e07] shadow-xs'
                : 'text-[#6B5D4F] hover:text-[#2B2118]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Tải từ máy
          </button>

          {showPresets && (
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'preset'
                  ? 'bg-white text-[#a33e07] shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#2B2118]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Ảnh món mẫu
            </button>
          )}

          {allowUrlInput && (
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-[#a33e07] shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#2B2118]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Nhập link
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,image/heic,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Upload Box / Preview Area */}
      {value ? (
        // Preview State with stats & actions
        <div className="bg-[#FAF5F0] border border-[#EAE0D5] rounded-2xl p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Image Preview Container */}
            <div className={`sm:col-span-5 relative rounded-xl overflow-hidden bg-white border border-[#EAE0D5] shadow-xs group ${getAspectStyle()}`}>
              <img
                src={value}
                alt="Ảnh xem trước"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-white text-[#2B2118] hover:bg-orange-50 font-bold text-xs flex items-center gap-1 shadow-md transition-transform transform hover:scale-105"
                  title="Thay ảnh khác từ máy"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Đổi ảnh
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs flex items-center gap-1 shadow-md transition-transform transform hover:scale-105"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              </div>
            </div>

            {/* Info & Stats */}
            <div className="sm:col-span-7 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ảnh món ăn đã sẵn sàng & tối ưu</span>
              </div>

              {compressionStats ? (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#1E3A2F]">
                    <span className="text-[11px] font-medium text-emerald-800">Dung lượng gốc:</span>
                    <span className="font-semibold">{formatFileSize(compressionStats.originalSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#1E3A2F]">
                    <span className="text-[11px] font-medium text-emerald-800">Sau khi nén ({compressionStats.format}):</span>
                    <span className="font-bold text-emerald-700">{formatFileSize(compressionStats.optimizedSize)}</span>
                  </div>
                  <div className="pt-1 border-t border-emerald-200/60 flex items-center justify-between text-emerald-900 font-bold text-[11px]">
                    <span className="flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                      Tiết kiệm dung lượng:
                    </span>
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                      -{compressionStats.reductionPercent}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 border border-[#EAE0D5] rounded-xl p-3 text-xs text-[#6B5D4F]">
                  <p className="font-medium text-[#2B2118]">Ảnh liên kết trực tuyến</p>
                  <p className="text-[11px] text-[#8C7D6F] truncate mt-0.5">{value}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-[#D1C2B4] hover:border-[#a33e07] bg-white text-xs font-bold text-[#2B2118] hover:text-[#a33e07] flex items-center gap-1.5 transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#a33e07]" />
                  Tải ảnh khác từ máy
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Gỡ ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Empty State: Tabs Content
        <div>
          {/* TAB 1: UPLOAD FROM DEVICE */}
          {activeTab === 'upload' && (
            <div
              ref={dropzoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${
                isDragging
                  ? 'border-[#a33e07] bg-[#FFF0E6] scale-[1.01]'
                  : 'border-[#D1C2B4] hover:border-[#a33e07] hover:bg-[#FFF9F5] bg-[#FAF5F0]/60'
              }`}
            >
              {isProcessing ? (
                <div className="py-4 flex flex-col items-center gap-2 text-[#a33e07]">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <p className="text-xs font-bold">Đang nén và tối ưu hóa hình ảnh...</p>
                  <p className="text-[11px] text-[#8C7D6F]">Tự động điều chỉnh độ phân giải và chất lượng</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center border border-[#FFE0CC] shadow-xs group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#2B2118]">
                      Kéo thả ảnh vào đây hoặc <span className="text-[#a33e07] underline">bấm để chọn từ máy</span>
                    </p>
                    <p className="text-xs text-[#7A6B5D] max-w-sm">
                      Hỗ trợ chụp từ camera hoặc chọn từ thư viện (JPG, PNG, WebP). Tự động nén siêu nhẹ, giữ độ sắc nét.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#9E8E80] pt-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Nén client-side giảm ~90%
                    </span>
                    <span>•</span>
                    <span>Có thể dán trực tiếp (Ctrl+V)</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: PRESET LIBRARY */}
          {activeTab === 'preset' && (
            <div className="border border-[#EAE0D5] bg-[#FAF5F0]/60 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#2B2118]">Chọn nhanh ảnh món ngon chuẩn đẹp:</p>
                <span className="text-[11px] text-[#8C7D6F]">Ảnh ẩm thực bản quyền cao cấp</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {DEFAULT_FOOD_PLACEHOLDERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="group rounded-xl overflow-hidden border border-[#EAE0D5] hover:border-[#a33e07] bg-white transition-all transform hover:-translate-y-0.5 text-left relative aspect-[4/3]"
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] text-white font-semibold line-clamp-1">
                        {preset.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ENTER URL */}
          {activeTab === 'url' && (
            <div className="border border-[#EAE0D5] bg-[#FAF5F0]/60 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-[#2B2118] block">Nhập đường dẫn ảnh trực tuyến (URL):</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... hoặc link ảnh bất kỳ"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl bg-white border border-[#EAE0D5] focus:outline-[#a33e07]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!customUrl.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#a33e07] hover:bg-[#8A3406] text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message if any */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
