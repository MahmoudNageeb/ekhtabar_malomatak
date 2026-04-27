'use client';
import { useRef, useState } from 'react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  required?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'ekhtabar_malomatak',
  label = 'رفع صورة',
  className = '',
  aspectRatio = 'video',
  required = false
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const aspectClass =
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'wide' ? 'aspect-[16/9]' :
    'aspect-video';

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      setProgress(30);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      setProgress(80);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل الرفع');
      }

      setProgress(100);
      onChange(data.url);

      setTimeout(() => setProgress(0), 500);
    } catch (e: any) {
      setError(e.message || 'فشل رفع الصورة');
      setProgress(0);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemove() {
    if (!confirm('حذف هذه الصورة؟')) return;
    onChange('');
  }

  function triggerSelect() {
    fileInputRef.current?.click();
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        // عرض الصورة المرفوعة
        <div className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden bg-gray-100 border-2 border-emerald-200 shadow-md group`}>
          <img src={value} alt="صورة مرفوعة" className="w-full h-full object-cover" />

          {/* Overlay للأدوات */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={triggerSelect}
              disabled={uploading}
              className="px-4 py-2 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition disabled:opacity-50"
            >
              🔄 تغيير
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:bg-red-600 transition"
            >
              🗑️ حذف
            </button>
          </div>

          {/* شارة "تم الرفع" */}
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            ✓ تم الرفع
          </div>
        </div>
      ) : (
        // زر الرفع
        <button
          type="button"
          onClick={triggerSelect}
          disabled={uploading}
          className={`relative ${aspectClass} w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
            uploading
              ? 'border-blue-400 bg-blue-50 cursor-wait'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          } disabled:opacity-70`}
        >
          {uploading ? (
            <>
              <div className="text-4xl animate-pulse">☁️</div>
              <p className="text-sm font-bold text-blue-700">جاري الرفع... {progress}%</p>
              <div className="w-2/3 h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl">📸</div>
              <p className="text-sm font-bold text-gray-700">اضغط لاختيار صورة</p>
              <p className="text-xs text-gray-500">JPG, PNG, WEBP - أقصى حجم 10MB</p>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
