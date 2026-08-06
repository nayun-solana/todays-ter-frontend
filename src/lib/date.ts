import type { DayOfWeek } from '../types/home/homeContent';

const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

/**
 * "2026-06-11" + "THURSDAY" → "2026년 6월 11일 목요일".
 *
 * 요일은 BE 값을 그대로 쓴다 — `new Date(...)`로 다시 계산하면 문자열이 UTC로 파싱돼
 * 한국 시간대에서 하루 밀릴 수 있다. 날짜도 같은 이유로 문자열을 직접 쪼갠다.
 */
export function formatKoreanDate(date: string, dayOfWeek: DayOfWeek): string {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return '';
  return `${year}년 ${Number(month)}월 ${Number(day)}일 ${DAY_LABEL[dayOfWeek]}`;
}
