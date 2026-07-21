import { useNavigate, useLocation } from 'react-router';
import { X } from 'lucide-react';

import checkIcon from '../../assets/review/check.png';

type CompleteLocationState = {
  placeName?: string;
};

export default function PlaceReviewCompletePage() {
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
        <img src={checkIcon} alt="" className="size-10" />
        <h1 className="mt-8 text-center text-xl font-extrabold text-gray-6">
          후기가 저장됐어요
        </h1>
        <p className="mt-3 text-center text-xs text-gray-6">
          {placeName}의 후기가 저장되었어요.
        </p>
      </div>
    </div>
  );
}
