import { useNavigate } from 'react-router';

import back from '../../../assets/matched-ter/back.svg';
import bookmark from '../../../assets/matched-ter/bookmark.svg';
import share from '../../../assets/matched-ter/share.svg';

/** 나와 어울리는 터 상단 앱바 — 뒤로/제목/북마크·공유. */
export default function MatchedTerAppBar({ title }: { title: string }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-3 bg-white px-5">
      <button type="button" onClick={() => navigate(-1)} aria-label="뒤로">
        <img src={back} alt="" className="size-6" />
      </button>
      <h1 className="text-sm font-bold text-gray-6">{title}</h1>
      <div className="flex gap-1.5">
        <button type="button" aria-label="북마크">
          <img src={bookmark} alt="" className="size-6" />
        </button>
        <button type="button" aria-label="공유">
          <img src={share} alt="" className="size-6" />
        </button>
      </div>
    </header>
  );
}
