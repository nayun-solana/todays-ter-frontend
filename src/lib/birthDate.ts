/**
 * 생년월일·태어난 시간 휠에서 쓰는 옵션과 포맷터.
 *
 * 온보딩1(`OnboardingPage1`)과 사주 수정(`SajuEditPage`)이 같은 값을 각각 정의하고 있었다.
 * UI 형태는 다르지만(바텀시트 vs 인라인 드롭다운) 고르는 대상은 같은 생년월일이라
 * "어떤 값을 고를 수 있는가"는 한 곳에서 정한다.
 *
 * 오늘 날짜를 인자로 받는다 — 모듈 로드 시점의 `new Date()`에 기대면 연말·자정 경계에서
 * 화면마다 다른 답이 나오고, 무엇보다 미래 날짜 차단을 테스트할 수 없다.
 */

export interface BirthDate {
  year: number;
  month: number;
  day: number;
}

/** 휠에 올리는 가장 이른 해. 시안 기준값이라 두 화면이 같아야 한다. */
export const BIRTH_YEAR_MIN = 1900;

export const MONTHS: readonly number[] = Array.from({ length: 12 }, (_, index) => index + 1);
export const HOURS: readonly number[] = Array.from({ length: 24 }, (_, index) => index);
export const MINUTES: readonly number[] = Array.from({ length: 60 }, (_, index) => index);

const range = (length: number) => Array.from({ length }, (_, index) => index + 1);

/**
 * 생년 후보를 오래된 해부터 — 1900 → 올해. 온보딩 바텀시트 휠이 이 순서다.
 *
 * ⚠️ 두 화면의 정렬이 반대라 하나로 합칠 수 없다. 합치면 한쪽 휠이 뒤집힌다.
 * 순서는 UI 형태에 딸린 선택이므로(#163의 시안 확인 항목) 정렬만 갈라 두고 범위는 공유한다.
 */
export function birthYearsAscending(today = new Date()): number[] {
  const currentYear = today.getFullYear();
  return Array.from({ length: currentYear - BIRTH_YEAR_MIN + 1 }, (_, i) => BIRTH_YEAR_MIN + i);
}

/** 생년 후보를 최근 해부터 — 올해 → 1900. 사주 수정 인라인 드롭다운이 이 순서다. */
export function birthYearsDescending(today = new Date()): number[] {
  const currentYear = today.getFullYear();
  return Array.from({ length: currentYear - BIRTH_YEAR_MIN + 1 }, (_, i) => currentYear - i);
}

/** 해당 연·월의 일수. month는 1-based (Date의 day 0 = 전달 마지막 날). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 미래 날짜는 휠에 아예 올리지 않는다 — 고른 뒤 막는 게 아니라 고를 수 없게 하는 게 시안이다.
 * 올해를 고르면 이번 달까지, 이번 달을 고르면 오늘까지만 옵션이 생긴다.
 */
export function maxMonth(year: number, today = new Date()): number {
  return year === today.getFullYear() ? today.getMonth() + 1 : 12;
}

export function maxDay(year: number, month: number, today = new Date()): number {
  if (year === today.getFullYear() && month === today.getMonth() + 1) return today.getDate();
  return daysInMonth(year, month);
}

/** 월 휠에 올릴 옵션. */
export function monthOptions(year: number, today = new Date()): number[] {
  return range(maxMonth(year, today));
}

/** 일 휠에 올릴 옵션. 연·월에 따라 길이가 달라진다. */
export function dayOptions(year: number, month: number, today = new Date()): number[] {
  return range(maxDay(year, month, today));
}

/** 연·월이 바뀌어 옵션이 줄면 월·일을 남은 범위 안으로 당긴다. */
export function clampDate({ year, month, day }: BirthDate, today = new Date()): BirthDate {
  const clampedMonth = Math.min(month, maxMonth(year, today));
  return { year, month: clampedMonth, day: Math.min(day, maxDay(year, clampedMonth, today)) };
}

export const pad = (value: number) => String(value).padStart(2, '0');

/** BE가 받는 생년월일 형식 — "1995-06-15". */
export function formatBirthDate({ year, month, day }: BirthDate): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** 0 → "오전 12시", 13 → "오후 1시". */
export function formatHour(hour: number): string {
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}시`;
}
