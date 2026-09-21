import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Upload, Plus, Trash2, Sparkles, CheckCircle2, 
  AlertCircle, ChefHat, Flame, Clock, Users, Tag, Image as ImageIcon,
  LogIn, User as UserIcon, Camera, Download, Link2, RefreshCw, 
  Wand2, X, Check, FileImage, Sparkle, Loader2, AlertTriangle, Search, Layers
} from 'lucide-react';
import { Recipe, PendingRecipe, AiReviewResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { optimizeImageFile, formatFileSize } from '../lib/imageOptimization';

interface SubmitRecipeScreenProps {
  onBack: () => void;
  onRecipeAdded: (recipe: Recipe) => void;
}

const PRESET_IMAGES = [
  { label: 'Phở bò Hà Nội', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4NBh3NNhtOti_SFH9N3XAJSdSCyx4t3HryLWxnN6Fp-2AvaMlCQpr8cJP8CurSgQO53qXnp4YtKERurYtlzJF-og-HPEzuzKNbwPrL6RHhmjIAPW3HoelRj4BDESY5OHwA_lS4cd1smP6vaGfYKbvAuQM_8pS-eFGypCyOmoXIBvVvRWHqlE4RMVPIKT_MQMlw9ZsteKy0C3Tqe1dHMsrQU64VYWuoFnXA0_sgE_ZIxAlFJ_Oj90jGA' },
  { label: 'Thịt kho hột vịt', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuPEDtuDvCbA_pc8r3LSuXPP0RBI8oR9aaBZzdTxHe_T_tglPb8oq4ZtebWysoaINtRo8VvWYlFMHr3HKKQ9Op37-NLZ28aybVi83ndchl_MbKSSBJJNEPK8zBVKnlw6ivrqCZEjadoiKXzbrpE48BN_vtBfqpxb9olumeqArPkz16oacxFdsEOWkXon-clGPHp30lBEyKLc0RqbkUWB7p19dxJLkpcnRCjndrqtSq-_V4nbtNGY7D9w' },
  { label: 'Gà hấp lá chanh', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6Fg-0zMlgYOFxmflhQH6yPC1RDFLIQ-wep1D8nYhnOOpqJH9SOa9j04Jg-PL1YJMdLnlv4hX7nJcJ1cQFrMsaH8WHx3NytBDqdvqO7R6hYtmjzegLRCkMDXbSBCam_ShEEqqGpjv5XSJlQA1U96qqieGOnNr52elW2qs49Zu6gXTqwSyUegmr4UTO3TUb6NdppIWSa0BZcTMH2qWY-UDr-B8KY248GloZ8i42BEvAm0xm8KPoymVbsQ' },
  { label: 'Đậu hũ sốt cà chua', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaTv8BZ-zND64DDdNuB47Nk7ovH2_DKQDzW0MwRz8EQkAc4iKSeinJ6rltQkMvJlf_rJTz3gWgwa_2drBaSB3sWvrBx4RV02eKePPbrtINft-PtK0TKwqSn5kBSBPHOjh9m6kTyyxT8ohkyM_qkQ9yjO1VdZe78Qx58eFukrfn_a195-NqDCtlF4ewHa7xLNz68tlwUZggOxbQZEYCVDRO4x9pGeuEPEzmlNaJes1qP_8ix4pc8iHGBg' },
  { label: 'Bún chả nướng', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80' },
  { label: 'Canh chua cá lóc', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' }
];

// Helper to compress and format image on client before submit using canvas and WebP/JPEG
async function compressImageFile(file: File): Promise<{ dataUrl: string; sizeKb: number; originalKb: number; reductionPercent: number; fileName: string }> {
  const result = await optimizeImageFile(file, { maxDimension: 1280, quality: 0.82 });
  return {
    dataUrl: result.dataUrl,
    sizeKb: Math.round(result.optimizedSize / 1024),
    originalKb: Math.round(result.originalSize / 1024),
    reductionPercent: result.reductionPercent,
    fileName: result.fileName
  };
}

export const SubmitRecipeScreen: React.FC<SubmitRecipeScreenProps> = ({
  onBack,
  onRecipeAdded
}) => {
  const { user, profile, openAuthModal } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [gallery, setGallery] = useState<string[]>([]);
  const [servings, setServings] = useState('4 Người');
  const [prepTime, setPrepTime] = useState('30 Phút');
  const [ingredients, setIngredients] = useState<Array<{ name: string; amount: string }>>([
    { name: 'Thịt bò bắp', amount: '400g' },
    { name: 'Cần tây', amount: '2 cây' },
    { name: 'Tỏi băm, hạt nêm', amount: 'Vừa đủ' }
  ]);
  const [steps, setSteps] = useState<Array<{ title: string; description: string; image?: string }>>([
    { title: 'Sơ chế nguyên liệu', description: 'Thịt bò thái mỏng ướp tỏi và gia vị trong 15 phút. Cần tây rửa sạch cắt khúc.' },
    { title: 'Xào nhanh lửa lớn', description: 'Phi thơm tỏi, xào thịt bò chín tái rồi trút ra. Xào cần tây vừa chín tới rồi cho thịt bò vào đảo đều, tắt bếp.' }
  ]);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Đồ mặn']);

  // Image source modes: 'upload' | 'ai' | 'presets' | 'url'
  const [imageMode, setImageMode] = useState<'upload' | 'ai' | 'presets' | 'url'>('upload');
  const [uploadedInfo, setUploadedInfo] = useState<{ fileName: string; sizeKb: number; originalKb?: number; reductionPercent?: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Image Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'home' | 'rustic' | 'modern'>('home');
  const [aiRatio, setAiRatio] = useState<'4:3' | '1:1' | '16:9'>('4:3');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenerateError, setAiGenerateError] = useState<string | null>(null);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    status: 'approved' | 'pending' | 'rejected_duplicate';
    message: string;
    recipe: Recipe | PendingRecipe;
    aiReview: AiReviewResponse;
  } | null>(null);

  // AI Duplicate pre-check state
  const [duplicateCheck, setDuplicateCheck] = useState<{
    checking: boolean;
    checked: boolean;
    isDuplicate: boolean;
    duplicateDishName?: string;
    duplicateSimilarity?: number;
    duplicateExplanation?: string;
    matchedRecipe?: any;
  } | null>(null);

  // Handle local file upload
  const handleProcessFile = async (file: File) => {
    try {
      const result = await compressImageFile(file);
      setImageUrl(result.dataUrl);
      setUploadedInfo({ 
        fileName: result.fileName, 
        sizeKb: result.sizeKb,
        originalKb: result.originalKb,
        reductionPercent: result.reductionPercent
      });
      setAiGeneratedSuccess(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xử lý hình ảnh.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Generate image using AI
  const handleGenerateAiImage = async () => {
    const targetDish = title.trim();
    const promptText = aiPrompt.trim();

    if (!targetDish && !promptText) {
      setAiGenerateError('Vui lòng nhập Tên món ăn hoặc Câu lệnh mô tả ảnh trước khi tạo.');
      return;
    }

    setAiGenerateError(null);
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/generate-recipe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: targetDish,
          prompt: promptText,
          ingredients: ingredients.map(i => i.name).filter(Boolean),
          style: aiStyle,
          aspectRatio: aiRatio
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setImageUrl(data.imageUrl);
        setAiGeneratedSuccess(true);
        setUploadedInfo(null);
      } else {
        setAiGenerateError(data.error || 'Không thể tạo ảnh AI lúc này. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error(err);
      setAiGenerateError('Lỗi kết nối máy chủ khi tạo ảnh AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAutoSuggestPrompt = () => {
    const dish = title.trim() || 'Món ăn Việt';
    const ingSummary = ingredients.map(i => i.name).filter(Boolean).slice(0, 3).join(', ');
    const ingClause = ingSummary ? ` với ${ingSummary}` : '';
    setAiPrompt(`Món ${dish}${ingClause} vừa nấu xong bốc khói thơm lừng, bày biện hấp dẫn trên đĩa gốm mộc, rắc tiêu và hành ngò, ánh sáng tự nhiên ấm cúng`);
  };

  const handleDownloadActiveImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title.trim() ? title.trim().replace(/\s+/g, '_') : 'mon_an'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, { title: `Bước ${steps.length + 1}`, description: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: 'title' | 'description' | 'image', value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleStepImageUpload = async (stepIndex: number, file: File) => {
    try {
      const result = await optimizeImageFile(file, { maxDimension: 800, quality: 0.8 });
      const updated = [...steps];
      updated[stepIndex] = { ...updated[stepIndex], image: result.dataUrl };
      setSteps(updated);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xử lý ảnh bước nấu ăn.');
    }
  };

  const handleRemoveStepImage = (stepIndex: number) => {
    const updated = [...steps];
    delete updated[stepIndex].image;
    setSteps(updated);
  };

  // Upload multiple gallery images from device
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await optimizeImageFile(files[i], { maxDimension: 1200, quality: 0.82 });
        setGallery(prev => [...prev, result.dataUrl]);
      } catch (err: any) {
        console.error('Lỗi khi nén ảnh bổ sung:', err);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // AI Duplicate pre-check function
  const triggerDuplicateCheck = async (dishTitle: string) => {
    const cleanTitle = dishTitle.trim();
    if (!cleanTitle || cleanTitle.length < 2) {
      setDuplicateCheck(null);
      return;
    }

    setDuplicateCheck({ checking: true, checked: false, isDuplicate: false });
    try {
      const res = await fetch('/api/check-duplicate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          ingredients: ingredients.filter(i => i.name.trim()),
          steps: steps.filter(s => s.description.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        setDuplicateCheck({
          checking: false,
          checked: true,
          isDuplicate: data.data.isDuplicate,
          duplicateDishName: data.data.duplicateDishName,
          duplicateSimilarity: data.data.duplicateSimilarity,
          duplicateExplanation: data.data.duplicateExplanation,
          matchedRecipe: data.data.matchedRecipe
        });
      } else {
        setDuplicateCheck(null);
      }
    } catch (err) {
      console.error('Check duplicate error:', err);
      setDuplicateCheck(null);
    }
  };

  // Debounce auto-check duplicate when user pauses typing title
  useEffect(() => {
    if (!title || title.trim().length < 4) {
      setDuplicateCheck(null);
      return;
    }
    const timer = setTimeout(() => {
      triggerDuplicateCheck(title);
    }, 700);
    return () => clearTimeout(timer);
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      openAuthModal({
        reason: 'Vui lòng đăng nhập để đăng công thức và ghi danh tác giả của bạn.',
        mode: 'login',
        pendingAction: {
          type: 'navigate_submit'
        }
      });
      return;
    }

    if (!title.trim()) {
      alert('Vui lòng nhập tên món ăn.');
      return;
    }
    const validIngredients = ingredients.filter(i => i.name.trim());
    if (validIngredients.length === 0) {
      alert('Vui lòng nhập ít nhất 1 nguyên liệu.');
      return;
    }
    const validSteps = steps.filter(s => s.description.trim());
    if (validSteps.length === 0) {
      alert('Vui lòng nhập ít nhất 1 bước thực hiện.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
        gallery,
        ingredients: validIngredients,
        steps: validSteps,
        categories: selectedTags,
        servings,
        prepTime,
        authorName: profile.display_name || 'Đầu bếp',
        authorUid: user.uid,
        authorAvatar: profile.avatar_url
      };

      const res = await fetch('/api/submit-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSubmitResult({
          status: data.status,
          message: data.message,
          recipe: data.recipe,
          aiReview: data.aiReview
        });
        if (data.status === 'approved') {
          onRecipeAdded(data.recipe);
        }
      } else {
        alert(data.error || 'Có lỗi xảy ra khi đăng bài.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE0D5] text-xs font-bold text-[#6B5D4F] hover:text-[#a33e07] transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Hủy & Quay lại
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] text-[#a33e07] border border-[#FFE0CC] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Tự Động Kiểm Duyệt & Tính Calo
        </div>
      </div>

      {/* Author Status Card */}
      {user ? (
        <div className="p-3.5 rounded-2xl bg-white border border-[#EAE0D5] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={profile?.avatar_url || user.photoURL || "https://lh3.googleusercontent.com/aida/AEtjO1WUGRKwJt61yJxD-Dlmzsu7TDTJj4LVw04i1duXEQ7azBuRk4ENCUrQD9Ml9nQ-3Vtf3Z61UHhqmhaf8H1v7wAqWFmti_VF1aaYM841DJ7I3uKBTi-lubE9IFGPpsVZ2YP5du2bmEs7F4eY-SbjMnU2Py4vVfHhTbmVeRhXRE15wfg0227_MspzRNa45vZsCTqyVUqWLNy5TMbJJDKufkbTIfa9VVlGLQTWK--u7Ph-UTEE57r6uQzhrhVz"}
              alt={profile?.display_name || user.displayName || 'Tác giả'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-[#EAE0D5]"
            />
            <div>
              <div className="text-xs font-bold text-[#2B2118]">
                Đăng với tư cách: <span className="text-[#a33e07]">{profile?.display_name || user.displayName || user.email?.split('@')[0] || 'Tác giả'}</span>
              </div>
              <div className="text-[10px] text-[#8C7D6F]">{profile?.email || user.email || ''}</div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            Tài khoản xác thực
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#FFF0E6] border border-[#FFE0CC] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#a33e07]" />
            <div>
              <div className="text-xs font-bold text-[#2B2118]">Chưa đăng nhập tài khoản</div>
              <div className="text-[11px] text-[#6B5D4F]">Đăng nhập để hiển thị tên tác giả và lưu vào hồ sơ cá nhân của bạn</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal({ mode: 'login', reason: 'Đăng nhập để đăng công thức với tên của bạn.' })}
            className="px-3 py-1.5 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold transition-all shadow-xs"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Recipe Photo & Basic Info */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE0D5] shadow-xs space-y-5">
          <h2 className="text-base font-bold text-[#2B2118] flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#a33e07]" />
            Thông tin cơ bản món ăn
          </h2>

          {/* Photo Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#a33e07]" />
                Hình ảnh món ăn <span className="text-red-500">*</span>
              </label>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F2EE] border border-[#EAE0D5] text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    imageMode === 'upload'
                      ? 'bg-white text-[#a33e07] shadow-xs'
                      : 'text-[#6B5D4F] hover:text-[#2B2118]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Tải từ máy
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImageMode('ai');
                    if (!aiPrompt && title.trim()) {
                      handleAutoSuggestPrompt();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    imageMode === 'ai'
                      ? 'bg-[#a33e07] text-white shadow-xs'
                      : 'text-[#a33e07] hover:bg-[#FFF0E6]'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Tạo bằng AI
                  <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-400 text-amber-950 font-extrabold uppercase ml-0.5">
                    Mới
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setImageMode('presets')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    imageMode === 'presets'
                      ? 'bg-white text-[#a33e07] shadow-xs'
                      : 'text-[#6B5D4F] hover:text-[#2B2118]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Ảnh mẫu
                </button>

                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                    imageMode === 'url'
                      ? 'bg-white text-[#a33e07] shadow-xs'
                      : 'text-[#6B5D4F] hover:text-[#2B2118]'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Link URL
                </button>
              </div>
            </div>

            {/* Container for Preview & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-[#FAF5F0] p-4 rounded-2xl border border-[#EAE0D5]">
              {/* Preview Box (4 cols on desktop) */}
              <div className="md:col-span-4 space-y-2">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white border border-[#EAE0D5] shadow-xs group">
                  <img
                    src={imageUrl}
                    alt={title ? `Hình ảnh món ${title}` : "Ảnh món ăn"}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Badge on Preview */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                    {aiGeneratedSuccess ? (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Tạo bằng AI
                      </>
                    ) : uploadedInfo ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Tải từ thiết bị ({uploadedInfo.sizeKb}KB)
                      </>
                    ) : (
                      <>
                        <FileImage className="w-3 h-3 text-[#EAE0D5]" />
                        Ảnh hiển thị
                      </>
                    )}
                  </div>

                  {/* Quick Download button */}
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={handleDownloadActiveImage}
                      title="Tải ảnh về máy"
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 transition-all opacity-90 hover:opacity-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-[#8C7D6F] text-center">
                  Ảnh này sẽ xuất hiện trên trang chủ và đầu bài viết của bạn.
                </div>
              </div>

              {/* Active Tab Panel (8 cols on desktop) */}
              <div className="md:col-span-8 bg-white p-4 rounded-xl border border-[#EAE0D5] shadow-2xs min-h-[220px] flex flex-col justify-center">
                {/* 1. UPLOAD TAB */}
                {imageMode === 'upload' && (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                        isDragging
                          ? 'border-[#a33e07] bg-[#FFF0E6]'
                          : 'border-[#D1C2B4] hover:border-[#a33e07] hover:bg-[#FFF8F0] bg-[#FAF5F0]/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#FFF0E6] text-[#a33e07] flex items-center justify-center border border-[#FFE0CC] shadow-2xs">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2B2118]">
                          Kéo thả ảnh vào đây, hoặc <span className="text-[#a33e07] underline">bấm để chọn từ máy</span>
                        </p>
                        <p className="text-[11px] text-[#8C7D6F] mt-1">
                          Hỗ trợ ảnh từ điện thoại, máy ảnh (JPG, PNG, WEBP). Tự động tối ưu dung lượng.
                        </p>
                      </div>
                    </div>

                    {uploadedInfo && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 font-semibold truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{uploadedInfo.fileName}</span>
                          <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold shrink-0">
                            {uploadedInfo.sizeKb} KB
                            {uploadedInfo.reductionPercent ? ` (giảm ${uploadedInfo.reductionPercent}%)` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 ml-2 cursor-pointer"
                        >
                          Đổi ảnh khác
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. AI GENERATE TAB */}
                {imageMode === 'ai' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B2118]">
                        <Sparkles className="w-4 h-4 text-[#a33e07]" />
                        Tạo ảnh món ăn độc quyền bằng Trí tuệ Nhân tạo
                      </div>
                      {title.trim() && (
                        <button
                          type="button"
                          onClick={handleAutoSuggestPrompt}
                          className="text-[11px] font-bold text-[#a33e07] hover:underline flex items-center gap-1"
                        >
                          <Sparkle className="w-3 h-3" />
                          Gợi ý từ tên món
                        </button>
                      )}
                    </div>

                    <div>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Mô tả món ăn bạn muốn AI vẽ (VD: Món bò xào cần tây khói nghi ngút, đĩa gốm cổ, rắc tiêu đen, rau thơm tươi ngon...)"
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Style selector */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[11px] font-semibold text-[#8C7D6F]">Phong cách:</span>
                        <div className="inline-flex rounded-lg border border-[#EAE0D5] p-0.5 bg-[#FAF5F0]">
                          <button
                            type="button"
                            onClick={() => setAiStyle('home')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                              aiStyle === 'home' ? 'bg-[#a33e07] text-white' : 'text-[#6B5D4F]'
                            }`}
                          >
                            Mộc mạc
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiStyle('rustic')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                              aiStyle === 'rustic' ? 'bg-[#a33e07] text-white' : 'text-[#6B5D4F]'
                            }`}
                          >
                            Đồ gốm xưa
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiStyle('modern')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                              aiStyle === 'modern' ? 'bg-[#a33e07] text-white' : 'text-[#6B5D4F]'
                            }`}
                          >
                            Sang trọng
                          </button>
                        </div>
                      </div>

                      {/* Ratio selector */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[11px] font-semibold text-[#8C7D6F]">Tỉ lệ:</span>
                        <div className="inline-flex rounded-lg border border-[#EAE0D5] p-0.5 bg-[#FAF5F0]">
                          <button
                            type="button"
                            onClick={() => setAiRatio('4:3')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                              aiRatio === '4:3' ? 'bg-[#a33e07] text-white' : 'text-[#6B5D4F]'
                            }`}
                          >
                            4:3
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiRatio('1:1')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                              aiRatio === '1:1' ? 'bg-[#a33e07] text-white' : 'text-[#6B5D4F]'
                            }`}
                          >
                            1:1
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiRatio('16:9')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                              aiRatio === '16:9' ? 'bg-[#a33e07] text-white' : 'text-[#6B5D4F]'
                            }`}
                          >
                            16:9
                          </button>
                        </div>
                      </div>
                    </div>

                    {aiGenerateError && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{aiGenerateError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        disabled={isGeneratingAi}
                        onClick={handleGenerateAiImage}
                        className="px-4 py-2 rounded-xl bg-[#a33e07] hover:bg-[#8c3405] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingAi ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            AI đang sáng tạo ảnh...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            {aiGeneratedSuccess ? 'Tạo lại phiên bản khác' : 'Tạo ảnh ngay'}
                          </>
                        )}
                      </button>

                      {aiGeneratedSuccess && (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã áp dụng ảnh AI vào món ăn
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. PRESETS TAB */}
                {imageMode === 'presets' && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-[#8C7D6F] block">
                      Chọn nhanh từ bộ sưu tập món ngon Việt Nam:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setImageUrl(img.url);
                            setUploadedInfo(null);
                            setAiGeneratedSuccess(false);
                          }}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                            imageUrl === img.url
                              ? 'border-[#a33e07] bg-[#FFF0E6] ring-1 ring-[#a33e07]'
                              : 'border-[#EAE0D5] bg-white hover:bg-[#FAF5F0]'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#EAE0D5]"
                          />
                          <span className="text-xs font-semibold text-[#2B2118] truncate">
                            {img.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. URL TAB */}
                {imageMode === 'url' && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[#6B5D4F] block">
                      Dán địa chỉ hình ảnh trực tiếp (URL hợp lệ):
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setUploadedInfo(null);
                        setAiGeneratedSuccess(false);
                      }}
                      placeholder="https://example.com/hinh-anh-mon-an.jpg"
                      className="w-full text-xs p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                    />
                    <p className="text-[11px] text-[#8C7D6F]">
                      Hỗ trợ liên kết ảnh từ Google Drive, Unsplash, Imgur hoặc bất kỳ website nào.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Image Gallery Upload Section */}
            <div className="pt-3 border-t border-[#EAE0D5] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-[#2B2118] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#a33e07]" />
                    Bộ sưu tập ảnh món ăn (Tải nhiều ảnh từ máy)
                  </label>
                  <p className="text-[11px] text-[#8C7D6F]">Tải thêm ảnh thành phẩm, các góc chụp khác. Bạn có thể chọn ảnh bất kỳ làm ảnh bìa.</p>
                </div>
                <label className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#a33e07] border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  + Thêm ảnh từ máy
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/heic"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                  {gallery.map((gUrl, gIdx) => (
                    <div key={gIdx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#EAE0D5] bg-white group shadow-2xs">
                      <img src={gUrl} alt={`Ảnh bổ sung ${gIdx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            const oldMain = imageUrl;
                            setImageUrl(gUrl);
                            setGallery(prev => prev.map((img, i) => i === gIdx ? oldMain : img));
                          }}
                          className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold cursor-pointer"
                          title="Đổi ảnh này thành ảnh bìa chính"
                        >
                          Làm bìa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(gIdx)}
                          className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#2B2118] flex items-center gap-1">
                  Tên món ăn <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => triggerDuplicateCheck(title)}
                  disabled={!title.trim() || duplicateCheck?.checking}
                  className="text-[11px] font-bold text-[#a33e07] hover:underline flex items-center gap-1 disabled:opacity-50"
                  title="Kiểm tra xem món này đã có trong kho công thức chưa"
                >
                  {duplicateCheck?.checking ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      AI đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <Search className="w-3 h-3" />
                      Kiểm tra trùng lặp AI
                    </>
                  )}
                </button>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDuplicateCheck(null);
                }}
                placeholder="Ví dụ: Bò xào cần tây thơm ngon, Canh gà lá giang..."
                className="w-full text-sm font-semibold p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                required
              />

              {/* Real-time / Pre-check Duplicate Result Banner */}
              {duplicateCheck?.checked && (
                <div className="mt-2 animate-in fade-in duration-200">
                  {duplicateCheck.isDuplicate ? (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between text-red-700 font-bold">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          AI cảnh báo: Đã có món "{duplicateCheck.duplicateDishName}"
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-[10px] font-extrabold">
                          {duplicateCheck.duplicateSimilarity}% tương đồng
                        </span>
                      </div>
                      {duplicateCheck.duplicateExplanation && (
                        <p className="text-[11px] text-red-800 leading-relaxed">
                          {duplicateCheck.duplicateExplanation}
                        </p>
                      )}
                      <div className="p-2 rounded-lg bg-red-100/70 text-[11px] font-medium text-red-950 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>
                          <strong>Quy chế kiểm duyệt:</strong> Món đã có sẽ <strong>KHÔNG ĐƯỢC DUYỆT</strong>. Bạn hãy điều chỉnh công thức với biến tấu riêng hoặc đổi sang món ăn mới!
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Tên món chưa có trong hệ thống, sẵn sàng để chia sẻ!
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Hợp lệ
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1">Mô tả ngắn</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Chia sẻ một vài câu ngắn về hương vị, nguồn gốc hoặc cảm hứng của món ăn này..."
                className="w-full text-xs p-3 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
              />
            </div>
          </div>

          {/* Meta inputs: Servings & PrepTime */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#a33e07]" />
                Khẩu phần
              </label>
              <input
                type="text"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="VD: 3-4 Người"
                className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2B2118] block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#a33e07]" />
                Thời gian nấu dự kiến
              </label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="VD: 25 Phút"
                className="w-full text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-[#2B2118] block flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#a33e07]" />
              Phân loại & Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {['Ăn chay', 'Đồ mặn', 'Dưới 15 phút', 'Ít calo', 'Miền Bắc', 'Miền Trung', 'Miền Nam'].map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#a33e07] text-white border-[#a33e07] font-bold'
                        : 'bg-[#FFF8F0] text-[#6B5D4F] border-[#EAE0D5] hover:bg-[#F7F2EE]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Ingredients Input List */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE0D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2B2118]">Danh sách nguyên liệu</h2>
              <p className="text-xs text-[#6B5D4F]">Ghi rõ tên và định lượng (vd: 500g, 2 quả, 1 muỗng)</p>
            </div>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-3 py-1.5 rounded-xl bg-[#FFF0E6] text-[#a33e07] text-xs font-bold flex items-center gap-1 hover:bg-[#FFE0CC]"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm dòng
            </button>
          </div>

          <div className="space-y-2.5">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tên nguyên liệu (VD: Thịt gà ta)"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                  required
                />
                <input
                  type="text"
                  placeholder="Định lượng (VD: 500g)"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                  className="w-32 sm:w-40 text-xs p-2.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] focus:outline-[#a33e07]"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-2 text-[#8C7D6F] hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Steps Input List */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE0D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2B2118]">Các bước thực hiện</h2>
              <p className="text-xs text-[#6B5D4F]">Hướng dẫn chi tiết từng bước để người nấu dễ làm theo</p>
            </div>
            <button
              type="button"
              onClick={handleAddStep}
              className="px-3 py-1.5 rounded-xl bg-[#FFF0E6] text-[#a33e07] text-xs font-bold flex items-center gap-1 hover:bg-[#FFE0CC]"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm bước
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((st, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#FFF8F0] border border-[#EAE0D5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#a33e07]">Bước {idx + 1}</span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-[#8C7D6F] hover:text-red-500 text-xs"
                    >
                      Xóa bước
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Tiêu đề bước (VD: Sơ chế, Ướp gia vị, Đảo trên lửa lớn...)"
                  value={st.title}
                  onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-lg bg-white border border-[#EAE0D5] focus:outline-[#a33e07]"
                />

                <textarea
                  rows={2}
                  placeholder="Mô tả chi tiết các thao tác thực hiện trong bước này..."
                  value={st.description}
                  onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-[#EAE0D5] focus:outline-[#a33e07]"
                  required
                />

                {/* Step Image Upload from Device */}
                <div className="pt-1">
                  {st.image ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-[#EAE0D5]">
                      <img
                        src={st.image}
                        alt={`Ảnh bước ${idx + 1}`}
                        className="w-16 h-12 object-cover rounded-lg border border-[#EAE0D5] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Đã thêm ảnh minh họa (tự động nén tối ưu)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <label className="text-[11px] text-[#a33e07] hover:underline font-bold cursor-pointer">
                            Đổi ảnh khác
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/jpg,image/heic"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleStepImageUpload(idx, file);
                              }}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[#D1C2B4]">•</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStepImage(idx)}
                            className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                          >
                            Xóa ảnh này
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[#D1C2B4] hover:border-[#a33e07] bg-white hover:bg-[#FFF8F0] text-[11px] font-bold text-[#6B5D4F] hover:text-[#a33e07] cursor-pointer transition-all">
                      <Camera className="w-3.5 h-3.5 text-[#a33e07]" />
                      <span>Thêm ảnh minh họa bước này (từ máy)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg,image/heic"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleStepImageUpload(idx, file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assurance Info Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0E6] to-[#FFF8F0] border border-[#FFE0CC] text-xs text-[#524436] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#a33e07]">
            <Sparkles className="w-4 h-4" />
            Hệ thống AI Gemini đồng hành cùng bạn:
          </div>
          <p className="leading-relaxed">
            Ngay khi bạn nhấn Đăng, AI sẽ tự động phân tích thành phần dinh dưỡng, ước tính hàm lượng calo (protein, chất béo, carbs) và tối ưu hóa thẻ phân loại để món ăn của bạn tiếp cận nhiều người yêu bếp hơn!
          </p>
        </div>

        {/* Action Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#a33e07] to-[#e8703a] hover:from-[#8c3405] hover:to-[#d65f29] text-white text-sm font-bold shadow-lg shadow-[#a33e07]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
        >
          {isSubmitting ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              AI Gemini đang phân tích dinh dưỡng và hoàn tất...
            </>
          ) : (
            <>
              <ChefHat className="w-5 h-5" />
              Đăng công thức món ăn ngay
            </>
          )}
        </button>
      </form>

      {/* Result / Success Modal */}
      {submitResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#EAE0D5] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                submitResult.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-600'
                  : submitResult.status === 'rejected_duplicate' || (submitResult.recipe as PendingRecipe)?.isDuplicate
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-600'
              }`}>
                {submitResult.status === 'approved' ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : submitResult.status === 'rejected_duplicate' || (submitResult.recipe as PendingRecipe)?.isDuplicate ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <AlertCircle className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-lg font-bold text-[#2B2118]">
                {submitResult.status === 'approved'
                  ? 'Công thức đã được duyệt tự động!'
                  : submitResult.status === 'rejected_duplicate' || (submitResult.recipe as PendingRecipe)?.isDuplicate
                  ? 'Không được duyệt: Món ăn đã tồn tại!'
                  : 'Đã gửi vào hàng đợi duyệt!'}
              </h3>

              <p className="text-xs text-[#6B5D4F]">
                {submitResult.message}
              </p>
            </div>

            {/* If Duplicate: Show Dedicated Warning Card */}
            {(submitResult.status === 'rejected_duplicate' || (submitResult.recipe as PendingRecipe)?.isDuplicate) && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs space-y-2.5 text-red-900">
                <div className="flex items-center justify-between font-bold text-red-800">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Chi tiết trùng lặp AI phát hiện:
                  </span>
                  {(submitResult.recipe as PendingRecipe)?.duplicateSimilarity && (
                    <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-[10px] font-extrabold">
                      {(submitResult.recipe as PendingRecipe).duplicateSimilarity}% tương đồng
                    </span>
                  )}
                </div>

                <div className="font-semibold text-red-950">
                  Trùng với món đã có: <span className="underline font-bold text-red-700">"{(submitResult.recipe as PendingRecipe)?.duplicateDishName || submitResult.aiReview?.duplicate_dish_name}"</span>
                </div>

                <p className="text-[11px] text-red-800 leading-relaxed italic">
                  "{(submitResult.recipe as PendingRecipe)?.duplicateExplanation || submitResult.aiReview?.duplicate_explanation || submitResult.aiReview?.reject_reason || 'Món ăn này đã có trên hệ thống với cùng công thức hoặc nguyên liệu tương tự.'}"
                </p>

                <div className="pt-2 border-t border-red-200 text-[11px] text-red-700 font-medium">
                  💡 <strong>Quy định kiểm duyệt:</strong> Để bảo đảm tính phong phú của kho công thức, hệ thống <strong>không duyệt bài trùng lặp</strong>. Bạn có thể nhấn <strong>"Chỉnh sửa lại công thức"</strong> để điều chỉnh tên hoặc nguyên liệu theo biến tấu của bạn!
                </div>
              </div>
            )}

            {/* AI Review Breakdown */}
            <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#EAE0D5] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#a33e07] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kết quả phân tích AI:
                </span>
                <span className="font-semibold text-emerald-700">
                  {submitResult.aiReview.difficulty} • {submitResult.aiReview.prep_time}
                </span>
              </div>

              {submitResult.aiReview.review_reason && (
                <p className="text-xs text-[#524436] italic">
                  "{submitResult.aiReview.review_reason}"
                </p>
              )}

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#EAE0D5] text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-[#EAE0D5]">
                  <div className="font-bold text-[#a33e07]">{submitResult.aiReview.calories}</div>
                  <div className="text-[10px] text-[#8C7D6F]">kcal</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#EAE0D5]">
                  <div className="font-bold text-[#2B2118]">{submitResult.aiReview.protein}g</div>
                  <div className="text-[10px] text-[#8C7D6F]">Protein</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#EAE0D5]">
                  <div className="font-bold text-amber-700">{submitResult.aiReview.fat}g</div>
                  <div className="text-[10px] text-[#8C7D6F]">Chất béo</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#EAE0D5]">
                  <div className="font-bold text-emerald-700">{submitResult.aiReview.carbs}g</div>
                  <div className="text-[10px] text-[#8C7D6F]">Carbs</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(submitResult.status === 'rejected_duplicate' || (submitResult.recipe as PendingRecipe)?.isDuplicate) && (
                <button
                  type="button"
                  onClick={() => setSubmitResult(null)}
                  className="flex-1 py-3 rounded-xl bg-white border border-[#EAE0D5] text-[#2B2118] text-xs font-bold hover:bg-[#F7F2EE] transition-all cursor-pointer"
                >
                  Chỉnh sửa lại công thức
                </button>
              )}
              <button
                onClick={onBack}
                className={`py-3 rounded-xl bg-[#a33e07] text-white text-xs font-bold hover:bg-[#8c3405] transition-all cursor-pointer ${
                  submitResult.status === 'rejected_duplicate' || (submitResult.recipe as PendingRecipe)?.isDuplicate ? 'flex-1' : 'w-full'
                }`}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
