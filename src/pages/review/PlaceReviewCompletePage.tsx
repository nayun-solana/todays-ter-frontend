import { useNavigate, useLocation, useParams } from 'react-router';

import checkIcon from '../../assets/review/check.png';
import Button from '../../components/Button';

type CompleteLocationState = {
  placeName?: string;
};

export default function PlaceReviewCompletePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  /**
   * 라우터 state가 없으면(새로고침·직접 진입) 장소명을 알 방법이 없다.
   * 예전에는 '청계천 모전교'로 폴백해서 다른 장소에 후기를 쓴 사용자에게 엉뚱한 이름을 보여줬다.
   */
  const placeName = (state as CompleteLocationState | null)?.placeName;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-1">
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <img src={checkIcon} alt="" className="size-10" />
        <h1 className="mt-8 text-center text-xl font-extrabold text-gray-6">후기가 저장됐어요</h1>
        <p className="mt-3 text-center text-xs text-gray-6">
          {placeName ? `${placeName}의 후기가 저장되었어요.` : '후기가 저장되었어요.'}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-5 pb-8">
        <Button
          size="padded"
          variant="primary"
          onClick={() => navigate(`/place/${id}`, { replace: true })}
        >
          장소 상세 화면으로 돌아가기
        </Button>
        <Button
          size="padded"
          variant="secondary"
          className="border-primary-light bg-primary-bg"
          onClick={() => navigate(`/place/${id}?tab=reviews`, { replace: true })}
        >
          내가 쓴 후기 보러가기
        </Button>
      </div>
    </div>
  );
}
