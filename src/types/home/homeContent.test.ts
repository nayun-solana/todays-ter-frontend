import { describe, expect, it } from 'vitest';

import {
  EnergyRoutinesResponse,
  HomeHeaderResponse,
  RecommendedPlacesResponse,
} from './homeContent';
import { TodayEnergyResponse, toOhaengKey } from './homeEnergy';

/**
 * 홈 API 계약 회귀 테스트.
 *
 * 추측 스키마로 버티다 BE 실계약과 어긋나 화면이 빈 적이 있다(#98: 추천 상세의
 * primaryElement가 문자열→객체로 바뀌자 zod가 throw → 빈 껍데기 렌더).
 * 아래 픽스처는 Swagger(`/v3/api-docs`, 2026-08-06) 기준 실응답 모양이다.
 * BE가 계약을 바꾸면 화면이 아니라 여기가 먼저 빨개져야 한다.
 */

describe('GET /home/header', () => {
  it('회원 응답을 파싱한다', () => {
    const parsed = HomeHeaderResponse.parse({
      userType: 'MEMBER',
      date: '2026-06-11',
      dayOfWeek: 'THURSDAY',
      nickname: '윤진',
      greeting: '안녕하세요 윤진님 !',
      subGreeting: '오늘도 좋은 기운 충전해요',
    });

    expect(parsed.greeting).toBe('안녕하세요 윤진님 !');
  });

  it('게스트는 닉네임이 없어도 통과한다', () => {
    expect(() =>
      HomeHeaderResponse.parse({
        userType: 'GUEST',
        date: '2026-06-11',
        dayOfWeek: 'THURSDAY',
        greeting: '안녕하세요 !',
        subGreeting: '오늘도 좋은 기운 충전해요',
      }),
    ).not.toThrow();
  });
});

describe('GET /home/today-energy', () => {
  it('오행을 { code, name } 객체로 받는다', () => {
    const parsed = TodayEnergyResponse.parse({
      date: '2026-06-11',
      element: { code: 'WATER', name: '수' },
      description: '안정과 균형의 기운.',
    });

    expect(toOhaengKey(parsed.element.code)).toBe('water');
  });

  it('예전 계약(오행이 문자열)은 거부한다', () => {
    expect(() =>
      TodayEnergyResponse.parse({
        date: '2026-06-11',
        element: 'WATER',
        description: '안정과 균형의 기운.',
      }),
    ).toThrow();
  });
});

describe('GET /home/energy-routines', () => {
  it('루틴을 { order, type, text } 배열로 받는다', () => {
    const parsed = EnergyRoutinesResponse.parse({
      element: { code: 'EARTH', name: '토' },
      routines: [
        { order: 2, type: 'REST', text: '계획 정리하기' },
        { order: 1, type: 'MEDITATION', text: '10분 명상하기' },
      ],
    });

    expect(parsed.routines).toHaveLength(2);
    expect(parsed.routines[0].text).toBe('계획 정리하기');
  });
});

describe('GET /home/recommended-place', () => {
  const guestResponse = {
    userType: 'GUEST',
    isLimited: true,
    visibleCount: 1,
    totalCount: 2,
    recommendations: [
      {
        placeId: 1,
        rankOrder: 1,
        placeName: '북촌한옥마을',
        thumbnailUrl: null,
        placeElement: 'EARTH',
        matchPercentage: 87,
        recommendationReason: '안정과 중심을 잡아주는 기운이 강합니다.',
        distanceKm: 3.5,
        averageRating: 4.7,
      },
    ],
    loginPrompt: {
      title: '로그인 후 더 많은 터를 탐색해보세요',
      buttonText: '로그인/회원가입 하러가기',
    },
  };

  it('게스트 응답을 파싱한다', () => {
    const parsed = RecommendedPlacesResponse.parse(guestResponse);

    // 게스트에게 몇 장을 보여줄지는 서버가 정한다 — FE 상수로 정하지 않는다.
    expect(parsed.visibleCount).toBe(1);
    expect(parsed.recommendations[0].placeId).toBe(1);
  });

  it('회원 응답은 loginPrompt가 없어도 통과한다', () => {
    expect(() =>
      RecommendedPlacesResponse.parse({
        ...guestResponse,
        userType: 'MEMBER',
        isLimited: false,
        visibleCount: 2,
        loginPrompt: null,
      }),
    ).not.toThrow();
  });

  it('추천이 비면 빈 배열로 온다', () => {
    const parsed = RecommendedPlacesResponse.parse({
      userType: 'MEMBER',
      isLimited: false,
      visibleCount: 0,
      totalCount: 0,
      recommendations: [],
    });

    expect(parsed.recommendations).toEqual([]);
  });
});
