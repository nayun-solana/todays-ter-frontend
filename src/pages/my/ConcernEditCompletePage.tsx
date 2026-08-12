import { useNavigate } from 'react-router';

import Button from '../../components/Button';
import { CheckIcon } from './SajuEditPage';

/** 고민유형 수정 완료 (Figma 3514:6046). 사주 리포트 완료 화면과 같은 체크 배지·버튼을 쓴다. */
export default function ConcernEditCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white">
      <main className="flex flex-1 -translate-y-6 flex-col items-center justify-center gap-8 text-center text-gray-6">
        <CheckIcon />
        <div>
          <h1 className="typo-head-2">고민유형 수정 완료</h1>
          <p className="typo-sub-2 mt-3">
            수정된 고민유형을 바탕으로
            <br />터 추천이 재생성되었어요!
          </p>
        </div>
      </main>
      <div className="flex flex-col gap-2 px-5 pb-8">
        <Button onClick={() => navigate('/my', { replace: true })}>마이페이지로 돌아가기</Button>
        {/* Figma: 보조 CTA는 primary-bg 채움 + primary-light 테두리 */}
        <Button
          variant="secondary"
          className="border-primary-light bg-primary-bg"
          onClick={() => navigate('/home', { replace: true })}
        >
          홈화면으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
