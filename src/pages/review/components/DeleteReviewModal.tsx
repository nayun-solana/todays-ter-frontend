type DeleteReviewModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteReviewModal({ onCancel, onConfirm }: DeleteReviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-review-title"
        className="w-full max-w-75 rounded-btn bg-white px-5 pb-5 pt-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="delete-review-title"
          className="text-center text-xl font-extrabold text-gray-6 leading-none"
        >
          후기를 삭제하시겠어요?
        </h2>
        <p className="mt-3 text-center text-xs text-gray-4 leading-none">
          삭제된 후기는 복구할 수 없습니다.
        </p>

        <div className="mt-10 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-btn bg-gray-disabled py-4 text-sm font-bold text-white leading-none"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-btn bg-primary py-4 text-sm font-bold text-white leading-none"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
