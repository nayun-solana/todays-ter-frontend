import { useNavigate } from 'react-router';

import back from '../../../assets/matched-ter/back.svg';
import bookmark from '../../../assets/matched-ter/bookmark.svg';
import share from '../../../assets/matched-ter/share.svg';

type MatchedTerAppBarProps = {
  title: string;
  /** 공유 실행. 없으면(사주 리포트 미보유 등) 공유 버튼을 비활성화한다. */
  onShare?: () => void;
  /** 공유받은 화면에서는 북마크·공유 액션을 감춘다. */
  showActions?: boolean;
};

/** 나와 어울리는 터 상단 앱바 — 뒤로/제목/북마크·공유. */
export default function MatchedTerAppBar({
  title,
  onShare,
  showActions = true,
}: MatchedTerAppBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-3 bg-white px-5">
      <button type="button" onClick={() => navigate(-1)} aria-label="뒤로">
        <img src={back} alt="" className="size-6" />
      </button>
      <h1 className="text-sm font-bold text-gray-6">{title}</h1>
      <div className="flex gap-1.5">
        {showActions ? (
          <>
            <button type="button" aria-label="북마크">
              <img src={bookmark} alt="" className="size-6" />
            </button>
            <button
              type="button"
              aria-label="공유"
              onClick={onShare}
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
    </header>
  );
}
