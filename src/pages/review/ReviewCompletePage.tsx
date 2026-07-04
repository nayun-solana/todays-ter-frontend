import { useNavigate, useLocation } from 'react-router';
import { X } from 'lucide-react';

import checkIcon from '../../assets/review/check.png';
import Button from './components/Button';

type CompleteLocationState = {
  placeName?: string;
};

export default function ReviewCompletePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const placeName =
    (state as CompleteLocationState | null)?.placeName ?? '청계천 모전교';

  return (
    <div className="flex min-h-screen flex-col bg-gray-1">
      <header className="flex items-center px-5 py-4">
        <button
          type="button"
          aria-label="닫기"
          onClick={() => navigate('/home', { replace: true })}
          className="flex size-6 shrink-0 items-center justify-center text-gray-6"
        >
          <X size={24} aria-hidden />
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <img src={checkIcon} alt="" className="size-16" />
        <h1 className="mt-6 text-center text-xl font-bold text-gray-6">
          방문 기록이 저장됐어요
        </h1>
        <p className="mt-2 text-center text-sm text-gray-4">
          {placeName}가 다녀온 터에 추가되었습니다.
        </p>
      </div>

      <div className="flex flex-col gap-2 px-5 pb-8">
        <Button onClick={() => navigate('/home', { replace: true })}>
          홈화면으로 돌아가기
        </Button>
        <Button variant="secondary">스토리 공유하기</Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/record', { replace: true })}
        >
          기록에서 보기
        </Button>
      </div>
    </div>
  );
}
