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

type FileAttachButtonProps = {
  className?: string;
  /** 최대 첨부 개수 */
  maxCount?: number;
  onFilesChange?: (files: File[]) => void;
};

export default function FileAttachButton({
  className,
  maxCount = 9,
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

    const remain = maxCount - items.length;
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

  const handleRemove = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);
    updateItems(items.filter((item) => item.id !== id));
  };

  const canAdd = items.length < maxCount;

  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square overflow-hidden rounded-2xl border border-gray-3 bg-gray-2"
        >
          <img src={item.url} alt="" className="size-full object-cover" />
          <button
            type="button"
            aria-label="이미지 삭제"
            onClick={() => handleRemove(item.id)}
            className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary-light text-white"
          >
            <X size={12} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      ))}

      {canAdd ? (
        <label
          htmlFor={inputId}
          className="flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-gray-3 bg-gray-2 text-gray-4 transition-colors hover:border-primary-light hover:bg-primary-bg hover:text-primary"
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
