import Button from '../../../components/Button';

type DeleteReviewModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * 후기 삭제 확인 (Figma 2380:2002).
 * 다이얼로그 324px / p20(위 30) / 제목 Head2 · 설명 Sub2(간격 12) · 버튼 40px 아래 2분할 gap8.
 * 장소 상세와 후기 상세가 같은 모달을 쓴다.
 */
export default function DeleteReviewModal({ onCancel, onConfirm }: DeleteReviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-[25px]"
      role="presentation"
      onClick={onCancel}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-review-title"
        className="w-full max-w-[324px] rounded-btn bg-white px-5 pt-[30px] pb-5 shadow-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="text-center">
          <h2 id="delete-review-title" className="typo-head-2 text-gray-6">
            후기를 삭제하시겠어요?
          </h2>
          <p className="typo-sub-2 mt-3 text-gray-6">삭제된 후기는 복구할 수 없습니다.</p>
        </div>
        <div className="mt-10 flex gap-2">
          <Button variant="neutral" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={onConfirm}>삭제</Button>
        </div>
      </section>
    </div>
  );
}
