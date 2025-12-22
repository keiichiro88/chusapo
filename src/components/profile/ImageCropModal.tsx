import React, { useState, useRef, useCallback } from 'react';
import { X, RotateCcw, Check, ZoomIn, ZoomOut, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (croppedImage: string) => void;
  aspectRatio?: number;
  cropShape?: 'circle' | 'rect';
}

interface CropState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  aspectRatio = 1,
  cropShape = 'circle'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [cropState, setCropState] = useState<CropState>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scaleStart, setScaleStart] = useState({ distance: 0, scale: 1 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // 画像読み込み完了時の初期化（アスペクト比を保持）
  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;
    
    const img = imageRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // 画像のアスペクト比を保ちながら、適切な初期スケールを計算
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;
    
    let initialScale;
    if (imageAspectRatio > containerAspectRatio) {
      // 横長画像：高さに合わせてスケール
      initialScale = containerRect.height / img.naturalHeight;
    } else {
      // 縦長または正方形画像：幅に合わせてスケール
      initialScale = containerRect.width / img.naturalWidth;
    }
    
    // スケールを少し大きめに設定して、画像がフレームを完全に覆うように
    initialScale = initialScale * 1.1;
    
    setCropState({
      x: 0,
      y: 0,
      scale: initialScale,
      rotation: 0
    });
    
    setImageLoaded(true);
  }, []);

  // タッチ間の距離を計算
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // マウス/タッチ開始
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ('touches' in e) {
      // タッチイベント
      if (e.touches.length === 1) {
        // 1本指：ドラッグ
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({
          x: touch.clientX - cropState.x,
          y: touch.clientY - cropState.y
        });
      } else if (e.touches.length === 2) {
        // 2本指：ピンチズーム
        setIsScaling(true);
        const distance = getTouchDistance(e.touches);
        setScaleStart({ distance, scale: cropState.scale });
      }
    } else {
      // マウスイベント
      setIsDragging(true);
      setDragStart({
        x: e.clientX - cropState.x,
        y: e.clientY - cropState.y
      });
    }
  }, [cropState.x, cropState.y, cropState.scale]);

  // マウス/タッチ移動
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ('touches' in e) {
      // タッチイベント
      if (e.touches.length === 1 && isDragging) {
        // 1本指ドラッグ
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;
        
        setCropState(prev => ({
          ...prev,
          x: newX,
          y: newY
        }));
      } else if (e.touches.length === 2 && isScaling) {
        // 2本指ピンチズーム（感度を下げて調整しやすく）
        const distance = getTouchDistance(e.touches);
        const scaleRatio = distance / scaleStart.distance;
        // 感度を0.3に下げて、ピンチ速度をさらにゆっくりに
        const dampedRatio = 1 + (scaleRatio - 1) * 0.3;
        const newScale = Math.max(0.1, Math.min(3, scaleStart.scale * dampedRatio));
        
        setCropState(prev => ({
          ...prev,
          scale: newScale
        }));
      }
    } else {
      // マウスイベント
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        setCropState(prev => ({
          ...prev,
          x: newX,
          y: newY
        }));
      }
    }
  }, [isDragging, isScaling, dragStart, scaleStart]);

  // マウス/タッチ終了
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsScaling(false);
  }, []);

  // ホイールズーム（感度を下げて調整しやすく）
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    // 感度をさらに下げて、より細かい調整が可能に
    const delta = e.deltaY > 0 ? -0.03 : 0.03;
    const newScale = Math.max(0.1, Math.min(3, cropState.scale + delta));
    
    setCropState(prev => ({
      ...prev,
      scale: newScale
    }));
  }, [cropState.scale]);

  // 回転
  const handleRotate = useCallback(() => {
    setCropState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  }, []);

  // リセット
  const handleReset = useCallback(() => {
    handleImageLoad();
  }, [handleImageLoad]);

  // 画像をクロップして保存（アスペクト比を保持した改良版）
  const handleSave = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // 出力サイズ
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // キャンバスをクリア
    ctx.clearRect(0, 0, outputSize, outputSize);
    
    // 保存状態を記録
    ctx.save();
    
    // 円形クロップの場合、クリッピングパスを設定
    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // プレビューサイズから出力サイズへのスケール比率
    const scaleFactor = outputSize / containerRect.width;
    
    // 変換をプレビューと同じ順序で適用
    // 1. キャンバスの中心に移動
    ctx.translate(outputSize / 2, outputSize / 2);
    
    // 2. ドラッグによる位置調整（スケールファクターを適用）
    ctx.translate(cropState.x * scaleFactor, cropState.y * scaleFactor);
    
    // 3. スケールを適用
    const finalScale = cropState.scale * scaleFactor;
    ctx.scale(finalScale, finalScale);
    
    // 4. 回転を適用
    ctx.rotate((cropState.rotation * Math.PI) / 180);
    
    // 5. 画像を中心に配置して描画（アスペクト比を保持）
    ctx.drawImage(
      img,
      -img.naturalWidth / 2,
      -img.naturalHeight / 2,
      img.naturalWidth,
      img.naturalHeight
    );
    
    // 状態を復元
    ctx.restore();
    
    // Base64データとして出力
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedImage);
    onClose();
  }, [cropState, cropShape, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      style={{ 
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      onTouchMove={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ 
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            キャンセル
          </button>
          <h3 className="text-lg font-semibold text-gray-900">画像を編集</h3>
          <button
            onClick={handleSave}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            完了
          </button>
        </div>

        {/* メイン編集エリア */}
        <div className="p-4">
          <div 
            ref={containerRef}
            className="relative mx-auto bg-gray-100 overflow-hidden select-none"
            style={{ 
              width: '280px', 
              height: '280px',
              borderRadius: cropShape === 'circle' ? '50%' : '12px',
              touchAction: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onWheel={handleWheel}
          >
            {imageUrl && (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="調整中の画像"
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.scale}) rotate(${cropState.rotation}deg)`,
                  transformOrigin: 'center',
                  userSelect: 'none',
                  transition: isDragging || isScaling ? 'none' : 'transform 0.2s ease-out',
                  // アスペクト比を保持するための重要な設定
                  maxWidth: 'none',
                  maxHeight: 'none',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                onLoad={handleImageLoad}
                onDragStart={(e) => e.preventDefault()}
              />
            )}
            
            {/* 操作ヒント */}
            {imageLoaded && !isDragging && !isScaling && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10">
                <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full text-xs font-medium text-gray-700 shadow-lg">
                  ドラッグで移動・ピンチで拡大縮小
                </div>
              </div>
            )}
          </div>
          
          {/* 調整情報 */}
          <div className="text-center mt-3">
            {imageLoaded && (
              <div className="text-xs text-gray-500 mb-1">
                拡大率: {Math.round(cropState.scale * 100)}%
              </div>
            )}
            <div className="text-xs text-gray-400">
              プロフィール画像として使用されます
            </div>
          </div>
        </div>

        {/* コントロールボタン */}
        <div 
          className="p-4 border-t border-gray-200"
          style={{ touchAction: 'auto' }}
        >
          {/* メインコントロール */}
          <div className="flex items-center justify-center space-x-4 mb-3">
            <button
              onClick={handleRotate}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="90度回転"
            >
              <RotateCcw className="h-5 w-5 text-gray-700" />
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
            >
              リセット
            </button>
          </div>
          
          {/* 細かい調整コントロール */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {/* ズームコントロール */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium text-center mb-3">拡大・縮小</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 font-medium mb-1">縮小</span>
                  <button
                    onClick={() => {
                      const newScale = Math.max(0.1, cropState.scale - 0.01);
                      setCropState(prev => ({ ...prev, scale: newScale }));
                    }}
                    className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                    title="縮小 (1%)"
                  >
                    <ZoomOut className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
                
                <span className="text-xs text-gray-600 w-16 text-center font-bold mx-2">
                  {Math.round(cropState.scale * 100)}%
                </span>
                
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 font-medium mb-1">拡大</span>
                  <button
                    onClick={() => {
                      const newScale = Math.min(3, cropState.scale + 0.01);
                      setCropState(prev => ({ ...prev, scale: newScale }));
                    }}
                    className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                    title="拡大 (1%)"
                  >
                    <ZoomIn className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* 位置調整コントロール */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium text-center mb-2">位置</p>
              <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                <div></div>
                <button
                  onClick={() => {
                    setCropState(prev => ({ ...prev, y: prev.y - 5 }));
                  }}
                  className="p-1 bg-white hover:bg-gray-100 rounded transition-colors shadow-sm"
                  title="上へ移動"
                >
                  <ChevronUp className="h-3 w-3 text-gray-700" />
                </button>
                <div></div>
                
                <button
                  onClick={() => {
                    setCropState(prev => ({ ...prev, x: prev.x - 5 }));
                  }}
                  className="p-1 bg-white hover:bg-gray-100 rounded transition-colors shadow-sm"
                  title="左へ移動"
                >
                  <ChevronLeft className="h-3 w-3 text-gray-700" />
                </button>
                <div className="p-1">
                  <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                </div>
                <button
                  onClick={() => {
                    setCropState(prev => ({ ...prev, x: prev.x + 5 }));
                  }}
                  className="p-1 bg-white hover:bg-gray-100 rounded transition-colors shadow-sm"
                  title="右へ移動"
                >
                  <ChevronRight className="h-3 w-3 text-gray-700" />
                </button>
                
                <div></div>
                <button
                  onClick={() => {
                    setCropState(prev => ({ ...prev, y: prev.y + 5 }));
                  }}
                  className="p-1 bg-white hover:bg-gray-100 rounded transition-colors shadow-sm"
                  title="下へ移動"
                >
                  <ChevronDown className="h-3 w-3 text-gray-700" />
                </button>
                <div></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 非表示のキャンバス（画像処理用） */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageCropModal;