import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { Plus, X } from 'lucide-react';

import { cn } from '../lib/cn';

type PreviewItem = {
  id: string;
  file: File;
  url: string;
};

export type ExistingImageItem = {
  key: string;
  url: string;
};

type FileAttachButtonProps = {
  className?: string;
  /** 최대 첨부 개수 (기존 썸네일 포함) */
  maxCount?: number;
  /** 이미 업로드된 이미지 — 추가 버튼과 같은 줄에 표시, X로 삭제 가능 */
  existingImages?: readonly ExistingImageItem[];
  onExistingImagesChange?: (images: ExistingImageItem[]) => void;
  onFilesChange?: (files: File[]) => void;
};

export default function FileAttachButton({
  className,
  maxCount = 9,
  existingImages = [],
  onExistingImagesChange,
  onFilesChange,
}: FileAttachButtonProps) {
  const inputId = useId();
  const [items, setItems] = useState<PreviewItem[]>([]);
  const itemsRef = useRef<PreviewItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const updateItems = (next: PreviewItem[]) => {
    setItems(next);
    onFilesChange?.(next.map((item) => item.file));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const remain = maxCount - existingImages.length - items.length;
    const selected = Array.from(files).slice(0, remain);
    const next = [
      ...items,
      ...selected.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ];

    updateItems(next);
    event.target.value = '';
  };

  const handleRemoveNew = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);
    updateItems(items.filter((item) => item.id !== id));
  };

  const handleRemoveExisting = (key: string) => {
    onExistingImagesChange?.(existingImages.filter((image) => image.key !== key));
  };

  const canAdd = existingImages.length + items.length < maxCount;

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {existingImages.map((image) => (
        <div
          key={image.key}
          className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-gray-3 bg-gray-2"
        >
          <img src={image.url} alt="" className="size-full object-cover" />
          <button
            type="button"
            aria-label="이미지 삭제"
            onClick={() => handleRemoveExisting(image.key)}
            className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary-light text-white"
          >
            <X size={12} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      ))}

      {items.map((item) => (
        <div
          key={item.id}
          className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-gray-3 bg-gray-2"
        >
          <img src={item.url} alt="" className="size-full object-cover" />
          <button
            type="button"
            aria-label="이미지 삭제"
            onClick={() => handleRemoveNew(item.id)}
            className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary-light text-white"
          >
            <X size={12} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      ))}

      {canAdd ? (
        <label
          htmlFor={inputId}
          className="flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-gray-3 bg-gray-2 text-gray-4 transition-colors hover:border-primary-light hover:bg-primary-bg hover:text-primary"
        >
          <Plus size={24} strokeWidth={2} aria-hidden />
          <span className="sr-only">이미지 추가</span>
        </label>
      ) : null}

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
