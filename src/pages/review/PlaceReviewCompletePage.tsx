import { useNavigate, useLocation, useParams } from 'react-router';

import checkIcon from '../../assets/review/check.png';
import Button from './components/Button';

type CompleteLocationState = {
  placeName?: string;
};

export default function PlaceReviewCompletePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const placeName =
    (state as CompleteLocationState | null)?.placeName ?? '청계천 모전교';

  return (
    <div className="flex min-h-screen flex-col bg-gray-1">
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <img src={checkIcon} alt="" className="size-10" />
        <h1 className="mt-8 text-center text-xl font-extrabold text-gray-6">
          후기가 저장됐어요
        </h1>
        <p className="mt-3 text-center text-xs text-gray-6">
          {placeName}의 후기가 저장되었어요.
        </p>
      </div>

      <div className="flex flex-col gap-2 px-5 pb-8">
        <Button onClick={() => navigate(`/place/${id}?tab=reviews`, { replace: true })}>
          후기 보러가기
        </Button>
      </div>
    </div>
  );
}
