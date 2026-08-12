import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router';

import back from '../../../assets/matched-ter/back.svg';
import share from '../../../assets/matched-ter/share.svg';

type MatchedTerAppBarProps = {
  title: string;
  /** 공유 실행. 없으면(사주 리포트 미보유 등) 공유 버튼을 비활성화한다. */
  onShare?: () => void;
  /** 공유 의사가 보일 때(포인터 접근·포커스) 링크를 미리 받아두기 위한 훅. */
  onSharePrefetch?: () => void;
  /** 저장 여부. 아이콘 채움으로 표시한다. */
  isSaved?: boolean;
  /** 저장/해제 토글. 없으면 버튼을 비활성화한다. */
  onToggleBookmark?: () => void;
  /**
   * 잠긴 이유. 시각적으로는 흐려진 아이콘으로 드러나지만, 스크린리더에는 그냥 '저장'으로
   * 읽혀 왜 못 누르는지 알 수 없다. 장소 상세와 같은 방식으로 라벨에 이유를 붙인다.
   */
  disabledReason?: string;
  /** 공유받은 화면에서는 북마크·공유 액션을 감춘다. */
  showActions?: boolean;
};

/** 나와 어울리는 터 상단 앱바 — 뒤로/제목/북마크·공유. */
export default function MatchedTerAppBar({
  title,
  onShare,
  onSharePrefetch,
  isSaved = false,
  onToggleBookmark,
  disabledReason,
  showActions = true,
}: MatchedTerAppBarProps) {
  const suffix = disabledReason ? ` (${disabledReason})` : '';
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-3 bg-white pt-safe">
      <div className="flex h-14 items-center justify-between px-5">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로">
          <img src={back} alt="" className="size-6" />
        </button>
        <h1 className="text-sm font-bold text-gray-6">{title}</h1>
        <div className="flex gap-1.5">
          {showActions ? (
            <>
              {/* 채움 여부로 상태를 보여줘야 해서 lucide 아이콘을 쓴다 —
                  <img>로 불러온 svg는 CSS로 fill을 바꿀 수 없다. */}
              <button
                type="button"
                aria-label={`${isSaved ? '저장 해제' : '저장'}${onToggleBookmark ? '' : suffix}`}
                aria-pressed={isSaved}
                onClick={onToggleBookmark}
                disabled={!onToggleBookmark}
                className="disabled:opacity-40"
              >
                <Bookmark
                  className={isSaved ? 'size-6 text-primary' : 'size-6 text-gray-4'}
                  fill={isSaved ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                aria-label={`공유${onShare ? '' : suffix}`}
                onClick={onShare}
                // 클릭보다 먼저 오는 이벤트에서 링크를 받아둔다 — 클릭 때 await가 없어야
                // navigator.share가 사용자 제스처를 유지한다.
                onPointerEnter={onSharePrefetch}
                onPointerDown={onSharePrefetch}
                onFocus={onSharePrefetch}
                disabled={!onShare}
                className="disabled:opacity-40"
              >
                <img src={share} alt="" className="size-6" />
              </button>
            </>
          ) : (
            // 뒤로가기 버튼과 폭을 맞춰 제목이 가운데 유지되게 한다
            <span aria-hidden className="size-6" />
          )}
        </div>
      </div>
    </header>
  );
}
