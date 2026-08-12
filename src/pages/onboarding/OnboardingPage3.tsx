// libraries
import { useState } from 'react';
import { useNavigate } from 'react-router';
// hooks
import { useAuthStatus } from '../../hooks/auth/useAuthStatus';
import { useMemberConcerns, useUpdateMemberConcerns } from '../../hooks/my/useMy';
import { useSaveGuestConcerns } from '../../hooks/onboarding/useGuestOnboarding';
import { isMemberOnboardingMissing } from '../../api/my';
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
 * 화면 구성은 같고 CTA 문구·이동 경로·저장 API만 다르다.
 */
export default function OnboardingPage3({ mode = 'onboarding' }: { mode?: 'onboarding' | 'edit' }) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const { isMember } = useAuthStatus();

  const [saveError, setSaveError] = useState<string | null>(null);
  const saveConcerns = useSaveGuestConcerns();

  // 수정 모드는 지금 고른 값이 무엇인지 보여줘야 한다 — 빈 화면에서 다시 고르게 하면
  // 사용자는 자기가 뭘 바꾸는지 모른 채 전체를 새로 입력하게 된다.
  const memberConcernsQuery = useMemberConcerns(isEdit && isMember);
  const updateConcerns = useUpdateMemberConcerns();
  const savedConcerns = memberConcernsQuery.data?.concernTypes;

  /**
   * 사용자가 건드리기 전까지는 서버 값을 그대로 보여준다(`SajuEditPage`와 같은 방식).
   *
   * effect로 서버 값을 state에 복사하지 않는다 — 응답이 늦게 오면 사용자가 이미 고른 선택을
   * 덮어쓰고, 그걸 막으려면 "한 번만 채웠는지" 플래그가 또 필요해진다. 파생값으로 두면
   * `draftIds`가 null인 동안만 서버 값이 보이고, 첫 토글에서 자연스럽게 넘어간다.
   */
  const [draftIds, setDraftIds] = useState<ConcernType[] | null>(null);
  const selectedIds = draftIds ?? savedConcerns ?? [];

  const isSaving = saveConcerns.isPending || updateConcerns.isPending;

  /**
   * 고민 유형 저장 후 다음 화면으로.
   *
   * 예전에는 API 호출이 하나도 없이 선택값을 navigate state로만 넘기고 버렸다
   * (주석: "저장 API가 아직 없어 UI만 완료 처리한다"). `PUT /api/guest-onboarding/concerns`는
   * 이미 배포돼 있다(실호출 200 확인).
   *
   * 수정 모드(`/my/concerns`)는 회원 전용 경로를 쓴다 — `PUT /members/me/concerns`.
   * 게스트 API는 로그인하면서 세션이 `CONVERTED`가 되어 부를 수 없다(`GUEST401_2`, 실측).
   *
   * 예전 주석에 적혀 있던 "저장돼도 화면이 안 바뀐다"는 **틀렸다.** 고민은 리포트 프롬프트에만
   * 쓰이는 게 아니라 장소 추천 **점수에 직접** 들어가고(`RecommendationMatchingService`),
   * 추천 스냅샷 캐시 키에 고민에서 파생된 `concernKey`가 들어가 있어서 고민이 바뀌면 서버가
   * 새로 계산한다. 리포트 재생성은 필요 없고, FE는 캐시만 비우면 된다(`useUpdateMemberConcerns`).
   */
  const submit = async () => {
    if (isSaving) return;

    if (isEdit) {
      setSaveError(null);
      try {
        await updateConcerns.mutateAsync({ concernTypes: selectedIds });
        navigate('/my/concerns/complete', { state: { selectedConcerns: selectedIds } });
      } catch (error) {
        // 회원에게 연결된 온보딩 행이 없는 경우(로그인 후 온보딩한 회원). 재시도해도 계속 404라
        // "잠시 후 다시" 안내는 거짓말이 된다 — 원인을 알려준다.
        setSaveError(
          isMemberOnboardingMissing(error)
            ? '사주 정보가 없어 고민 유형을 저장할 수 없어요. 먼저 사주 리포트를 만들어주세요.'
            : '고민 유형을 저장하지 못했어요. 잠시 후 다시 시도해주세요.',
        );
      }
      return;
    }

    // 여기는 첫 온보딩 경로다. 회원은 게스트 저장 API를 부를 수 없고(`GUEST401_2`),
    // 회원용 `PUT /members/me/concerns`도 아직 못 쓴다 — 연결된 `Onboarding` 행이 없어
    // `MEMBER404_3`이 난다(이슈 #156 1번, BE 대기). 로그인 직후 온보딩으로 들어오는 경로가
    // 있어서 `edit`만 막아두면 여기서 401 → 강제 로그아웃으로 이어졌다(#145).
    if (isMember) {
      navigate('/home', { state: { selectedConcerns: selectedIds } });
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
    setDraftIds((prev) => {
      const base = prev ?? savedConcerns ?? [];
      return base.includes(id) ? base.filter((v) => v !== id) : [...base, id];
    });
  };

  return (
    <div className="flex min-h-dvh w-full flex-col px-5 pb-8 pt-[calc(1rem+env(safe-area-inset-top))]">
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
          // BE가 `@NotEmpty`라 빈 선택은 400이다 — 보내기 전에 막는다.
          disabled={selectedIds.length === 0 || isSaving}
          onClick={() => void submit()}
        >
          {isSaving ? '저장 중…' : isEdit ? '고민유형 수정 완료' : '오늘의 터 시작하기'}
        </Button>
      </div>
    </div>
  );
}
