import React, { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { uploadAvatar, updateProfileAvatar, deleteAvatar } from '../../lib/storage';

interface ImageUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  onUploadComplete: (url: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  userId,
  currentImageUrl,
  onUploadComplete,
  size = 'md',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // アップロード
      const uploadResult = await uploadAvatar(userId, file);
      
      if (!uploadResult.success) {
        setError(uploadResult.error || 'アップロードに失敗しました');
        setPreviewUrl(currentImageUrl || null);
        return;
      }

      // プロフィール更新
      const updateResult = await updateProfileAvatar(userId, uploadResult.url!);
      
      if (!updateResult.success) {
        setError(updateResult.error || 'プロフィールの更新に失敗しました');
        return;
      }

      onUploadComplete(uploadResult.url!);
    } catch (err) {
      console.error('Upload error:', err);
      setError('予期しないエラーが発生しました');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      const deleteResult = await deleteAvatar(userId);
      if (!deleteResult.success) {
        setError(deleteResult.error || '削除に失敗しました');
        return;
      }

      const updateResult = await updateProfileAvatar(userId, null);
      if (!updateResult.success) {
        setError(updateResult.error || 'プロフィールの更新に失敗しました');
        return;
      }

      setPreviewUrl(null);
      onUploadComplete(null);
    } catch (err) {
      console.error('Remove error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* プロフィール画像 */}
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:border-brand-400 transition-colors`}
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="プロフィール画像"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* 削除ボタン */}
        {previewUrl && !isUploading && (
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
            title="画像を削除"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ファイル入力（非表示） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* 操作ボタン */}
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
      >
        {isUploading ? 'アップロード中...' : previewUrl ? '画像を変更' : '画像を追加'}
      </button>

      {/* エラー表示 */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;

