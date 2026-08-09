// libraries
import { useState } from 'react';
import { useNavigate } from 'react-router';
// hooks
import { useSaveGuestConcerns } from '../../hooks/onboarding/useGuestOnboarding';
// types
import type { ConcernType } from '../../types/onboarding/guestOnboarding';
// components
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import CategoryCard from './components/CategoryCard';

//assets
import num1 from '../../assets/onboarding/3-1.svg';
import num2 from '../../assets/onboarding/3-2.svg';
import num3 from '../../assets/onboarding/3-3.svg';
import num4 from '../../assets/onboarding/3-4.svg';
import num5 from '../../assets/onboarding/3-5.svg';
import num6 from '../../assets/onboarding/3-6.svg';

const CONCERN_ICONS = [num1, num2, num3, num4, num5, num6];

interface Concern {
  /** BE `ConcernType` 값을 그대로 쓴다 — 화면용 id를 따로 두면 매핑 층이 하나 더 생긴다. */
  id: ConcernType;
  title: string;
  description: string;
}

const CONCERNS: Concern[] = [
  { id: 'LOVE', title: '연애운', description: '사랑과 인연 찾기' },
  { id: 'CAREER', title: '커리어운', description: '직장·취업·이직' },
  { id: 'WEALTH', title: '재물운', description: '돈·투자·사업' },
  { id: 'RELATIONSHIP', title: '인간관계', description: '친구·가족·동료' },
  { id: 'HEALTH', title: '건강운', description: '몸과 마음의 균형' },
  { id: 'OTHER', title: '기타', description: '그 외 고민들' },
];

/**
 * 온보딩3 — 고민 유형 선택 (다중 선택).
 * `mode="edit"`는 마이페이지에서 다시 들어오는 고민유형 수정 화면(Figma 3514:5768).
 * 화면 구성은 같고 CTA 문구·이동 경로만 다르다. 저장 API가 아직 없어 UI만 완료 처리한다.
 */
export default function OnboardingPage3({ mode = 'onboarding' }: { mode?: 'onboarding' | 'edit' }) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [selectedIds, setSelectedIds] = useState<ConcernType[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveConcerns = useSaveGuestConcerns();

  /**
   * 고민 유형 저장 후 다음 화면으로.
   *
   * 예전에는 API 호출이 하나도 없이 선택값을 navigate state로만 넘기고 버렸다
   * (주석: "저장 API가 아직 없어 UI만 완료 처리한다"). `PUT /api/guest-onboarding/concerns`는
   * 이미 배포돼 있다(실호출 200 확인).
   *
   * ⚠️ 수정 모드(`/my/concerns`)에서는 저장을 시도하지 않는다. 이유가 둘이다(이슈 #133).
   *
   *    1. **이 API를 부를 수 없다.** 로그인 시 게스트 온보딩이 회원으로 이관되면서
   *       `Onboarding.guestSession = null` · `GuestSession.status = CONVERTED`가 된다.
   *       `getValidGuestSession`이 ACTIVE가 아닌 세션을 거부해 `GUEST401_2`로 실패한다(실측).
   *       회원용 고민 저장 엔드포인트는 BE에 아직 없다(`/members`에는 `me/saju`뿐).
   *    2. **저장돼도 화면이 안 바뀐다.** 고민은 리포트 생성 프롬프트에만 쓰인다
   *       (`FortuneReportPromptProvider`). 이미 만들어진 리포트는 그대로라
   *       재생성과 한 세트로 설계해야 한다 — 그래서 저장만 붙이는 건 오히려 혼란스럽다.
   */
  const submit = async () => {
    if (saveConcerns.isPending) return;

    if (isEdit) {
      navigate('/my/concerns/complete', { state: { selectedConcerns: selectedIds } });
      return;
    }

    setSaveError(null);
    try {
      await saveConcerns.mutateAsync({ concernTypes: selectedIds });
      navigate('/home', { state: { selectedConcerns: selectedIds } });
    } catch {
      setSaveError('고민 유형을 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const toggle = (id: ConcernType) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  return (
    <div className="flex min-h-dvh w-full flex-col px-5 pb-8 pt-4">
      {/* 상단 진행바 — 시안은 3분할 세그먼트(2/3 채움)이나 크로스팟 ProgressBar(연속형)로 근사 */}
      <ProgressBar step={2} total={3} />

      <header className="mt-11 flex flex-col gap-4">
        <p className="text-base font-bold text-primary">고민 유형 선택</p>
        <div className="flex flex-col gap-2.5">
          <h1 className="text-2xl font-extrabold leading-8 text-gray-6">
            어떤 고민을
            <br />
            해결하고 싶나요?
          </h1>
          <p className="text-sm font-bold text-gray-5">원하는 항목을 모두 선택해주세요</p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-2.5">
        {CONCERNS.map((concern, index) => (
          <CategoryCard
            icon={CONCERN_ICONS[index]}
            key={concern.id}
            title={concern.title}
            description={concern.description}
            selected={selectedIds.includes(concern.id)}
            onClick={() => toggle(concern.id)}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {saveError ? (
          <p role="alert" className="text-center text-xs font-bold text-danger">
            {saveError}
          </p>
        ) : null}
        <Button
          variant="primary"
          disabled={selectedIds.length === 0 || saveConcerns.isPending}
          onClick={() => void submit()}
        >
          {saveConcerns.isPending
            ? '저장 중…'
            : isEdit
              ? '고민유형 수정 완료'
              : '오늘의 터 시작하기'}
        </Button>
      </div>
    </div>
  );
}
