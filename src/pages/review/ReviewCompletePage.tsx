import { useNavigate, useLocation } from 'react-router';

import checkIcon from '../../assets/review/check.png';
import Button from './components/Button';

type CompleteLocationState = {
  matchedTerName?: string;
};

export default function ReviewCompletePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const matchedTerName =
    (state as CompleteLocationState | null)?.matchedTerName ?? '청계천 모전교';

  return (
    <div className="flex min-h-dvh flex-col bg-gray-1">
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <img src={checkIcon} alt="" className="size-10" />
        <h1 className="mt-8 text-center text-xl font-extrabold text-gray-6">
          방문 기록이 저장됐어요
        </h1>
        <p className="mt-3 text-center text-xs text-gray-6">
          {matchedTerName}가 다녀온 터에 추가되었습니다.
        </p>
      </div>

      <div className="flex flex-col gap-2 px-5 pb-8">
        <Button onClick={() => navigate('/home', { replace: true })}>
          홈화면으로 돌아가기
        </Button>
        <Button
          variant="secondary"
          /** 방금 쓴 기록은 다녀온 터에만 보이므로 해당 탭으로 바로 보낸다. */
          onClick={() => navigate('/record?tab=visited', { replace: true })}
        >
          기록에서 보기
        </Button>
      </div>
    </div>
  );
}
