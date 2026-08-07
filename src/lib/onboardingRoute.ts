/**
 * BE `onboardingStep` → 이어서 보여줄 화면.
 * 온보딩1 사주 → 온보딩2 리포트 생성 → 온보딩3 고민 → 홈 순서에 대응한다.
 */
export function nextPathForOnboardingStep(onboardingStep: string): string {
  switch (onboardingStep) {
    case 'STARTED':
      return '/onboarding/step-1';
    case 'SAJU_COMPLETED':
      return '/onboarding/step-2';
    case 'REPORT_GENERATED':
      return '/onboarding/step-3';
    // COMPLETED, 그리고 BE가 나중에 값을 추가했을 때. 회원인데 화면이 안 뜨는 것보다 홈이 낫다.
    default:
      return '/home';
  }
}
