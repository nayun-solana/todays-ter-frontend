import { useScrollLock } from '../../../lib/scrollLock';

interface BirthTimeSkipSheetProps {
  open: boolean;
  /** '출생시간 입력하기' — 시트를 닫고 시간 입력을 계속한다. */
  onClose: () => void;
  /** '간이 리포트 생성하기' — 출생시간 없이 진행한다. */
  onConfirm: () => void;
}

/** 온보딩1 '시간 모름' 선택 시 뜨는 '출생시간 없이 진행' 바텀시트. (Figma 1137:1804) */
export default function BirthTimeSkipSheet({ open, onClose, onConfirm }: BirthTimeSkipSheetProps) {
  // 시트가 떠 있는 동안 뒤 화면이 스크롤되지 않게 한다.
  useScrollLock(open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="relative w-full rounded-t-btn bg-white px-5 pb-8 pt-8">
        <h2 className="text-xl font-extrabold text-gray-6">출생시간 없이 진행할까요?</h2>

        <div className="mt-6 flex flex-col gap-3 rounded-btn border border-gray-2 bg-gray-1 px-5 py-4">
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-bold text-primary">사주 제외</p>
            <p className="text-xs leading-4 text-gray-6">
              출생시간 정보 없이 간이 리포트를 생성해요.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-bold text-primary">정확도 안내</p>
            <p className="text-xs leading-4 text-gray-6">일부 해석은 간단하게 제공될 수 있어요.</p>
          </div>
        </div>

        {/* 시안(3354:3524)은 '간이 리포트 생성하기'가 위(primary), '돌아가서…'가 아래다. */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 w-full rounded-btn bg-primary text-sm font-bold text-white"
          >
            간이 리포트 생성하기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-btn bg-primary-bg text-sm font-bold text-primary"
          >
            돌아가서 출생시간 입력하기
          </button>
        </div>
      </div>
    </div>
  );
}
