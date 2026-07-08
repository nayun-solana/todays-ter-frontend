interface BirthTimeSkipSheetProps {
  open: boolean;
  /** '출생시간 입력하기' — 시트를 닫고 시간 입력을 계속한다. */
  onClose: () => void;
  /** '간이 리포트 생성하기' — 출생시간 없이 진행한다. */
  onConfirm: () => void;
}

/** 온보딩1 '시간 모름' 선택 시 뜨는 '출생시간 없이 진행' 바텀시트. (Figma 1137:1804) */
export default function BirthTimeSkipSheet({ open, onClose, onConfirm }: BirthTimeSkipSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-[375px] rounded-t-btn bg-white px-5 pb-8 pt-8">
        <h2 className="text-xl font-extrabold text-gray-6">출생시간 없이 진행할까요?</h2>

        <div className="mt-6 flex flex-col gap-3 rounded-btn border border-gray-2 bg-gray-1 px-5 py-4">
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-bold text-primary">사주 제외</p>
            <p className="text-xs leading-4 text-gray-6">출생시간 정보 없이 간이 리포트를 생성해요.</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-bold text-primary">정확도 안내</p>
            <p className="text-xs leading-4 text-gray-6">일부 해석은 간단하게 제공될 수 있어요.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-btn border border-primary-light bg-primary-bg px-5 py-4 text-sm font-bold text-primary"
          >
            출생시간 입력하기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-btn bg-primary px-5 py-4 text-sm font-bold text-white shadow-btn"
          >
            간이 리포트 생성하기
          </button>
        </div>
      </div>
    </div>
  );
}
