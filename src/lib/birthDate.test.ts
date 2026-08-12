import { describe, expect, it } from 'vitest';

import {
  BIRTH_YEAR_MIN,
  birthYearsAscending,
  birthYearsDescending,
  clampDate,
  dayOptions,
  daysInMonth,
  formatBirthDate,
  formatHour,
  maxDay,
  maxMonth,
  monthOptions,
  pad,
} from './birthDate';

/** 2026-08-12(수). 미래 차단은 '오늘'에 의존하므로 고정 날짜로 본다. */
const TODAY = new Date(2026, 7, 12);

describe('생년 목록', () => {
  it('두 화면의 정렬이 반대다 — 같은 범위를 뒤집어 쓴다', () => {
    const ascending = birthYearsAscending(TODAY);
    const descending = birthYearsDescending(TODAY);

    expect(ascending[0]).toBe(BIRTH_YEAR_MIN);
    expect(ascending.at(-1)).toBe(2026);
    expect(descending[0]).toBe(2026);
    expect(descending.at(-1)).toBe(BIRTH_YEAR_MIN);
    expect([...descending].reverse()).toEqual(ascending);
  });

  it('올해까지 포함한다 — 올해 태어난 사람도 골라야 한다', () => {
    expect(birthYearsAscending(TODAY)).toHaveLength(2026 - 1900 + 1);
  });
});

describe('미래 날짜 차단', () => {
  it('올해는 이번 달까지만 고를 수 있다', () => {
    expect(maxMonth(2026, TODAY)).toBe(8);
    expect(monthOptions(2026, TODAY)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('지난 해는 12월까지 전부 고를 수 있다', () => {
    expect(maxMonth(2025, TODAY)).toBe(12);
    expect(monthOptions(2025, TODAY)).toHaveLength(12);
  });

  it('이번 달은 오늘까지만 고를 수 있다', () => {
    expect(maxDay(2026, 8, TODAY)).toBe(12);
    expect(dayOptions(2026, 8, TODAY).at(-1)).toBe(12);
  });

  it('지난 달은 그 달의 마지막 날까지 고를 수 있다', () => {
    expect(maxDay(2026, 7, TODAY)).toBe(31);
    expect(maxDay(2026, 2, TODAY)).toBe(28);
    expect(maxDay(2024, 2, TODAY)).toBe(29); // 윤년
  });

  it('daysInMonth는 오늘과 무관하게 달력상 일수를 준다', () => {
    // maxDay와 달리 미래를 자르지 않는다 — 자르는 책임은 maxDay에만 둔다.
    expect(daysInMonth(2026, 8)).toBe(31);
  });
});

describe('clampDate', () => {
  it('옵션이 줄면 월·일을 남은 범위 안으로 당긴다', () => {
    // 2000년 12월 31일 상태에서 연도만 올해로 바꾸면 12월도 31일도 남아있지 않다.
    expect(clampDate({ year: 2026, month: 12, day: 31 }, TODAY)).toEqual({
      year: 2026,
      month: 8,
      day: 12,
    });
  });

  it('월을 먼저 당기고 그 월 기준으로 일을 당긴다', () => {
    // 2월로 바꾸면 31일은 28일이 된다. 월을 당기지 않고 일만 보면 이 계산이 틀린다.
    expect(clampDate({ year: 2025, month: 2, day: 31 }, TODAY)).toEqual({
      year: 2025,
      month: 2,
      day: 28,
    });
  });

  it('범위 안의 날짜는 그대로 둔다', () => {
    expect(clampDate({ year: 1995, month: 6, day: 15 }, TODAY)).toEqual({
      year: 1995,
      month: 6,
      day: 15,
    });
  });
});

describe('포맷터', () => {
  it('BE 생년월일 형식은 0을 채운다', () => {
    expect(formatBirthDate({ year: 1995, month: 6, day: 15 })).toBe('1995-06-15');
    expect(pad(5)).toBe('05');
  });

  it('자정과 정오는 12시로 읽는다 — 0시·12시로 쓰면 오전 0시가 된다', () => {
    expect(formatHour(0)).toBe('오전 12시');
    expect(formatHour(12)).toBe('오후 12시');
    expect(formatHour(9)).toBe('오전 9시');
    expect(formatHour(13)).toBe('오후 1시');
    expect(formatHour(23)).toBe('오후 11시');
  });
});
