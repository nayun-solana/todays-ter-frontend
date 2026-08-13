import { useNavigate, useLocation } from 'react-router';

import checkIcon from '../../assets/review/check.png';
import Button from '../../components/Button';
import { withSubjectParticle } from '../../lib/korean';

type CompleteLocationState = {
  matchedTerName?: string;
};

export default function ReviewCompletePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  /**
   * 라우터 state가 없으면(새로고침·직접 진입) 장소명을 알 방법이 없다.
   *
   * 예전에는 '청계천 모전교'로 폴백해서, **전혀 다른 곳을 다녀온 사용자에게
   * "청계천 모전교가 다녀온 터에 추가되었습니다"**라고 알렸다. 목데이터가 남아
   * 거짓말을 하는 자리라, 이름을 모르면 이름 없이 말한다.
   */
  const matchedTerName = (state as CompleteLocationState | null)?.matchedTerName;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-1">
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <img src={checkIcon} alt="" className="size-10" />
        <h1 className="mt-8 text-center text-xl font-extrabold text-gray-6">
          방문 기록이 저장됐어요
        </h1>
        <p className="mt-3 text-center text-xs text-gray-6">
          {matchedTerName
            ? `${withSubjectParticle(matchedTerName)} 다녀온 터에 추가되었습니다.`
            : '다녀온 터에 추가되었습니다.'}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-5 pb-8">
        <Button size="padded" onClick={() => navigate('/home', { replace: true })}>
          홈화면으로 돌아가기
        </Button>
        <Button
          size="padded"
          variant="secondary"
          className="border-primary-light bg-primary-bg"
          /** 방금 쓴 기록은 다녀온 터에만 보이므로 해당 탭으로 바로 보낸다. */
          onClick={() => navigate('/record?tab=visited', { replace: true })}
        >
          기록에서 보기
        </Button>
      </div>
    </div>
  );
}
