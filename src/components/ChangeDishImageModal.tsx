import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Camera, 
  AlertCircle,
  FileImage,
  Layers
} from 'lucide-react';
import { Recipe } from '../types';
import { optimizeImageFile, formatFileSize, DEFAULT_FOOD_PLACEHOLDERS } from '../lib/imageOptimization';
import { useAuth } from '../context/AuthContext';

interface ChangeDishImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  onImageUpdated: (newImageUrl: string, updatedRecipe: Recipe) => void;
}

export const ChangeDishImageModal: React.FC<ChangeDishImageModalProps> = ({
  isOpen,
  onClose,
  recipe,
  onImageUpdated
}) => {
  const { showToast } = useAuth();
  const [newImage, setNewImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    optimizedSize: number;
    reductionPercent: number;
    fileName: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'preset'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !recipe) return null;

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const result = await optimizeImageFile(file, {
        maxDimension: 1280,
        quality: 0.82,
        format: 'auto'
      });

      setNewImage(result.dataUrl);
      setCompressionStats({
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        reductionPercent: result.reductionPercent,
        fileName: result.fileName
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xử lý hình ảnh.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSave = async () => {
    if (!newImage) {
      setErrorMessage('Vui lòng chọn ảnh mới từ máy tính trước khi lưu.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/recipes/${recipe.id}/image`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: newImage })
      });

      const data = await res.json();
      if (data.success && data.data) {
        onImageUpdated(newImage, data.data);
        showToast(`Đã thay đổi ảnh cho món "${recipe.title}" thành công! 🎉`, 'success');
        
        // Phát event cập nhật toàn trang
        window.dispatchEvent(new CustomEvent('recipeUpdated', { detail: data.data }));
        window.dispatchEvent(new Event('profileUpdated'));

        onClose();
      } else {
        setErrorMessage(data.error || 'Không thể lưu thay đổi ảnh.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối khi lưu ảnh.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#EAE0D5] shadow-2xl p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE0D5] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#2B2118]">Thay đổi ảnh món ăn</h3>
              <p className="text-xs text-[#8C7D6F] line-clamp-1">{recipe.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8C7D6F] hover:text-black hover:bg-[#F7F2EE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg,image/heic,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Comparison: Current vs New */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 items-center">
          {/* Current Image */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#6B5D4F] block">Ảnh hiện tại:</span>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F7F2EE] border border-[#EAE0D5] relative">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* New Selected Image */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#a33e07] block">Ảnh mới sẽ thay thế:</span>
            <div 
              onClick={() => !newImage && fileInputRef.current?.click()}
              className={`aspect-[4/3] rounded-xl overflow-hidden border-2 relative flex items-center justify-center ${
                newImage 
                  ? 'border-emerald-500 bg-white' 
                  : 'border-dashed border-[#D1C2B4] hover:border-[#a33e07] bg-[#FFF8F0]/60 cursor-pointer'
              }`}
            >
              {newImage ? (
                <>
                  <img
                    src={newImage}
                    alt="Ảnh mới"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold hover:bg-black/80 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Đổi
                  </button>
                </>
              ) : (
                <div className="text-center p-3 space-y-1">
                  <UploadCloud className="w-6 h-6 text-[#a33e07] mx-auto" />
                  <p className="text-[11px] font-bold text-[#2B2118]">Chọn ảnh mới</p>
                  <p className="text-[9px] text-[#8C7D6F]">Từ máy tính</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compression Statistics if new image uploaded */}
        {compressionStats && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1 text-emerald-900">
            <div className="flex items-center justify-between font-medium">
              <span>Dung lượng gốc: {formatFileSize(compressionStats.originalSize)}</span>
              <span>Sau khi nén: <strong>{formatFileSize(compressionStats.optimizedSize)}</strong></span>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tiết kiệm {compressionStats.reductionPercent}% dung lượng – Tải siêu mượt!</span>
            </div>
          </div>
        )}

        {/* Source Selector: Upload or Presets */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-[#EAE0D5] pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`font-bold pb-1 flex items-center gap-1 transition-all ${
                activeTab === 'upload' 
                  ? 'text-[#a33e07] border-b-2 border-[#a33e07]' 
                  : 'text-[#6B5D4F] hover:text-[#2B2118]'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Tải từ thư viện máy
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`font-bold pb-1 flex items-center gap-1 transition-all ${
                activeTab === 'preset' 
                  ? 'text-[#a33e07] border-b-2 border-[#a33e07]' 
                  : 'text-[#6B5D4F] hover:text-[#2B2118]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Chọn ảnh mẫu đẹp
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#a33e07] bg-[#FFF0E6]'
                  : 'border-[#D1C2B4] hover:border-[#a33e07] bg-[#FAF5F0]/50 hover:bg-[#FFF9F5]'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2 text-[#a33e07] text-xs font-bold py-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang nén và tối ưu hóa ảnh...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#2B2118]">
                    Bấm để chọn ảnh từ máy hoặc kéo thả vào đây
                  </p>
                  <p className="text-[10px] text-[#8C7D6F]">
                    Hỗ trợ JPG, PNG, WebP, HEIC. Tự động nén chuẩn món ăn.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {DEFAULT_FOOD_PLACEHOLDERS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNewImage(item.url);
                    setCompressionStats(null);
                  }}
                  className="rounded-xl overflow-hidden border border-[#EAE0D5] hover:border-[#a33e07] aspect-[4/3] relative group"
                >
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[9px] text-white font-bold text-center px-1">{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAE0D5]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-[#D1C2B4] text-xs font-bold text-[#6B5D4F] hover:bg-stone-50 transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!newImage || isSaving || isProcessing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:from-[#8c3405] hover:to-[#d65f29] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Đang lưu ảnh...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Xác nhận thay đổi ảnh
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
