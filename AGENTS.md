# 오늘의 터 Frontend 작업 규칙

## 디자인 시스템

- Figma UI 작업 전 대상 node와 `src/index.css`의 기존 토큰·공용 컴포넌트를 확인한다.
- 새 UI의 색상은 `primary`, `gray-*`, `ohaeng-*` 토큰을 사용한다. 브랜드 색상·Figma SVG/이미지 자산을 제외한 raw hex는 추가하지 않는다.
- Figma Typography와 일치하는 텍스트는 `typo-head-*`, `typo-body-*`, `typo-sub-*`, `typo-caption`을 사용한다. 같은 규격의 임의 `text-[...]`, `leading-[...]` 조합은 추가하지 않는다.
- Color·Typography 이외의 컴포넌트 variant, spacing, radius, shadow는 Figma 명세가 있을 때만 추가한다. 없는 값은 추측해 전역화하지 않는다.
- 토큰 변경은 `src/index.css`에서 한 번만 수정하고, 기존 공용 컴포넌트 API와 관련 없는 화면 흐름은 유지한다.

## 검증

- UI 또는 토큰 변경 후 `pnpm lint`와 `pnpm build`를 실행한다.
