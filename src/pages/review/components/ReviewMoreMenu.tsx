import { Pencil, Trash2 } from 'lucide-react';

type ReviewMoreMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function ReviewMoreMenu({ onEdit, onDelete }: ReviewMoreMenuProps) {
  return (
    <div
      role="menu"
      className="absolute top-full right-0 z-20 w-32 overflow-hidden rounded-2xl bg-white py-1 shadow-btn border border-gray-2"
    >
      <button
        type="button"
        role="menuitem"
        onClick={onEdit}
        className="flex w-full items-center justify-between py-3 text-sm font-bold text-gray-5 px-5"
      >
        수정하기
        <Pencil size={20} strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={onDelete}
        className="flex w-full items-center justify-between py-3 text-sm font-bold text-gray-5 border-t border-gray-2 px-5"
      >
        삭제하기
        <Trash2 size={20} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
