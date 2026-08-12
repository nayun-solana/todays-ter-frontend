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
import { cn } from '../../lib/cn';

//assets
import num1 from '../../assets/onboarding/3-1.svg';
import num2 from '../../assets/onboarding/3-2.svg';
import num3 from '../../assets/onboarding/3-3.svg';
import num4 from '../../assets/onboarding/3-4.svg';
import num5 from '../../assets/onboarding/3-5.svg';
import num6 from '../../assets/onboarding/3-6.svg';

const CONCERN_ICONS = [num1, num2, num3, num4, num5, num6];

/**
 * 회원 고민 유형 조회·저장 실패 문구. 조회와 저장이 같은 이유로 실패하므로 한 곳에서 만든다.
 *
 * 온보딩 행이 없는 회원(`MEMBER404_3`)은 다시 시도해도 계속 404다 —
 * "잠시 후 다시 시도해주세요"는 거짓말이 되므로 원인을 알려준다.
 */
function concernSaveErrorMessage(error: unknown): string {
  return isMemberOnboardingMissing(error)
    ? '사주 정보가 없어 고민 유형을 저장할 수 없어요. 먼저 사주 리포트를 만들어주세요.'
    : '고민 유형을 저장하지 못했어요. 잠시 후 다시 시도해주세요.';
}

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

  /**
   * 프리필이 끝나기 전에는 고를 수 없게 잠근다.
   *
   * ⚠️ 잠그지 않으면 **저장돼 있던 고민이 조용히 지워진다.** 응답 전에 카드를 하나 누르면
   * `draftIds`가 채워져, 뒤늦게 도착한 서버 값이 화면에 영영 안 나타난다. 그 상태로 저장하면
   * `PUT`이 전체 치환이라(BE `onboarding.updateConcerns(request.concernTypes())`)
   * 사용자가 본 적 없는 기존 선택이 날아간다 — 저장값 [LOVE, HEALTH]에서 CAREER만 빨리
   * 누르면 결과가 [CAREER]가 된다.
   *
   * `SajuEditPage`에는 이 노출이 없다. 그쪽은 필드를 하나씩 치환하지만 여기는 배열 전체다.
   */
  const isPrefilling = isEdit && isMember && memberConcernsQuery.isPending;
  const isSaving = saveConcerns.isPending || updateConcerns.isPending;

  /**
   * 조회 실패도 저장 실패와 같은 문구로 알린다.
   *
   * 이걸 안 보여주면 조회에 실패한 회원이 "아직 아무것도 저장 안 됨"과 구분되지 않는 빈 화면을
   * 보고, 다 고르고 저장을 눌러서야 문제를 알게 된다. 특히 `MEMBER404_3`은 저장도 같은 이유로
   * 실패할 것이 확정이라 미리 말해주는 편이 낫다.
   */
  const loadError = memberConcernsQuery.isError
    ? concernSaveErrorMessage(memberConcernsQuery.error)
    : null;
  const errorMessage = saveError ?? loadError;

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
    if (isSaving || isPrefilling) return;

    if (isEdit) {
      setSaveError(null);
      try {
        await updateConcerns.mutateAsync({ concernTypes: selectedIds });
        navigate('/my/concerns/complete', { state: { selectedConcerns: selectedIds } });
      } catch (error) {
        setSaveError(concernSaveErrorMessage(error));
      }
      return;
    }

    /**
     * 회원은 회원 경로로 저장한다.
     *
     * 온보딩1에서 `POST /api/guest-sessions/convert`로 온보딩을 회원에게 옮기면서 게스트 쿠키가
     * 지워진다. 그래서 여기서는 게스트 API를 부를 수 없고(`GUEST_COOKIE_REQUIRED`), 대신
     * 연결된 `Onboarding` 행이 생겼으므로 `PUT /members/me/concerns`가 동작한다.
     *
     * 예전에는 저장을 통째로 건너뛰고 홈으로 보냈다 — 그 행이 없어 `MEMBER404_3`이 났기
     * 때문인데(#156 1번), 이전이 붙으면서 해소됐다.
     */
    if (isMember) {
      setSaveError(null);
      try {
        await updateConcerns.mutateAsync({ concernTypes: selectedIds });
        navigate('/home', { state: { selectedConcerns: selectedIds } });
      } catch (error) {
        setSaveError(concernSaveErrorMessage(error));
      }
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
    // 프리필 전 입력은 받지 않는다 — 위 `isPrefilling` 주석 참고.
    if (isPrefilling) return;

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
          <h1 className="typo-head-1 text-gray-6">
            어떤 고민을
            <br />
            해결하고 싶나요?
          </h1>
          <p className="text-sm font-bold text-gray-5">원하는 항목을 모두 선택해주세요</p>
        </div>
      </header>

      {/* 저장된 값을 불러오는 동안은 누를 수 없다 — 먼저 누르면 서버 값을 못 본 채 덮어쓴다. */}
      <div
        aria-busy={isPrefilling}
        className={cn('mt-8 grid grid-cols-2 gap-2.5', isPrefilling && 'pointer-events-none')}
      >
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
        {errorMessage ? (
          <p role="alert" className="text-center typo-body-4 text-danger">
            {errorMessage}
          </p>
        ) : null}
        <Button
          variant="primary"
          // BE가 `@NotEmpty`라 빈 선택은 400이다 — 보내기 전에 막는다.
          disabled={selectedIds.length === 0 || isSaving || isPrefilling}
          onClick={() => void submit()}
        >
          {isPrefilling
            ? '불러오는 중…'
            : isSaving
              ? '저장 중…'
              : isEdit
                ? '고민유형 수정 완료'
                : '오늘의 터 시작하기'}
        </Button>
      </div>
    </div>
  );
}
