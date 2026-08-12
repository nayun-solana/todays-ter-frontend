import { describe, expect, it } from 'vitest';

import { viewStateOf } from './queryState';

describe('viewStateOf', () => {
  it('데이터가 손에 있으면 ready — 재검증 중이어도 화면은 그대로 그린다', () => {
    expect(viewStateOf({ data: { a: 1 }, isError: false, fetchStatus: 'fetching' })).toBe('ready');
    expect(viewStateOf({ data: null, isError: false, fetchStatus: 'idle' })).toBe('ready');
  });

  it('데이터가 있으면 에러가 있어도 ready — 이전 성공값을 지우지 않는다', () => {
    expect(viewStateOf({ data: { a: 1 }, isError: true, fetchStatus: 'idle' })).toBe('ready');
  });

  it('에러면 failed', () => {
    expect(viewStateOf({ data: undefined, isError: true, fetchStatus: 'idle' })).toBe('failed');
  });

  it('오프라인 판정으로 멈춘 것(paused)도 failed — 스켈레톤에 갇히지 않게 한다', () => {
    expect(viewStateOf({ data: undefined, isError: false, fetchStatus: 'paused' })).toBe('failed');
  });

  it('그 외에는 loading', () => {
    expect(viewStateOf({ data: undefined, isError: false, fetchStatus: 'fetching' })).toBe(
      'loading',
    );
    expect(viewStateOf({ data: undefined, isError: false, fetchStatus: 'idle' })).toBe('loading');
  });
});
