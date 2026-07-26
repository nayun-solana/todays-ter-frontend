import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';

type ReviewHeaderProps = {
  title: string;
  onClose?: () => void;
  rightSlot?: ReactNode;
};

export default function ReviewHeader({ title, onClose, rightSlot }: ReviewHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center border-b border-gray-2 bg-white p-5">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose ?? (() => navigate(-1))}
        className="flex size-6 shrink-0 items-center justify-center text-gray-5"
      >
        <X size={24} aria-hidden />
      </button>
      <h1 className="flex-1 text-center text-sm font-bold text-gray-6">{title}</h1>
      {rightSlot ?? <div className="size-6 shrink-0" aria-hidden />}
    </header>
  );
}
