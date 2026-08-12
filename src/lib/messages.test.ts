import { describe, expect, it } from 'vitest';

import {
  loadFailureMessage,
  loadFailureMessageBrief,
  loadingMessage,
  loadingMoreMessage,
} from './messages';

/**
 * 리팩토링으로 화면에 뜨는 문구가 바뀌지 않았는지 고정한다.
 * 아래 문자열은 각 화면에 원래 적혀 있던 값 그대로다 — 바꾸려면 카피 결정이 먼저다.
 */
describe('조회 상태 문구', () => {
  it('로딩 문구가 기존 화면 문구와 같다', () => {
    expect(loadingMessage('장소')).toBe('장소를 불러오는 중입니다.'); // 탐색
    expect(loadingMessage('장소 정보')).toBe('장소 정보를 불러오는 중입니다.'); // 장소 상세
    expect(loadingMessage('후기')).toBe('후기를 불러오는 중입니다.'); // 장소 상세 후기탭
    expect(loadingMessage('알림')).toBe('알림을 불러오는 중입니다.'); // 알림
    expect(loadingMessage('알림 설정')).toBe('알림 설정을 불러오는 중입니다.'); // 알림 설정
    expect(loadingMessage('약관')).toBe('약관을 불러오는 중입니다.'); // 약관
    expect(loadingMessage('에디터 픽')).toBe('에디터 픽을 불러오는 중입니다.'); // 홈 에디터픽
    expect(loadingMessage('현재 사주 정보')).toBe('현재 사주 정보를 불러오는 중입니다.'); // 사주 수정
  });

  it('다음 페이지 로딩 문구가 기존 화면 문구와 같다', () => {
    expect(loadingMoreMessage('장소')).toBe('장소를 더 불러오는 중입니다.');
    expect(loadingMoreMessage('알림')).toBe('알림을 더 불러오는 중입니다.');
  });

  it('재시도 안내가 붙는 실패 문구가 기존 화면 문구와 같다', () => {
    expect(loadFailureMessage('장소')).toBe(
      '장소를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    expect(loadFailureMessage('후기')).toBe(
      '후기를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    expect(loadFailureMessage('알림')).toBe(
      '알림을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    expect(loadFailureMessage('알림 설정')).toBe(
      '알림 설정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    expect(loadFailureMessage('약관')).toBe(
      '약관을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    expect(loadFailureMessage('사주 정보')).toBe(
      '사주 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
    expect(loadFailureMessage('마이페이지 정보')).toBe(
      '마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
  });

  it('재시도 안내가 없던 화면은 그대로 짧은 형태를 쓴다', () => {
    expect(loadFailureMessageBrief('목록')).toBe('목록을 불러오지 못했습니다.'); // 내 터
    expect(loadFailureMessageBrief('후기')).toBe('후기를 불러오지 못했습니다.'); // 후기 상세
    expect(loadFailureMessageBrief('장소 정보')).toBe('장소 정보를 불러오지 못했습니다.'); // 장소 상세
    expect(loadFailureMessageBrief('에디터 픽')).toBe('에디터 픽을 불러오지 못했습니다.'); // 홈 에디터픽
  });
});
