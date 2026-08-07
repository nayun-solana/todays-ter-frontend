import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./reissue', () => ({ reissueOnce: vi.fn() }));

import { queryClient } from '../app/queryClient';
import { useAuthStore } from '../stores/authStore';
import { reissueOnce } from './reissue';
import { restoreSession } from './session';
import { clearAccessToken, getAccessToken, setAccessToken } from './token';

const mockedReissueOnce = vi.mocked(reissueOnce);

beforeEach(() => {
  vi.clearAllMocks();
  clearAccessToken();
  useAuthStore.setState({ isRestoringSession: true });
  queryClient.clear();
});

describe('부팅 세션 복원', () => {
  it('토큰이 있으면 재발급을 부르지 않는다', async () => {
    setAccessToken('existing-token');

    await restoreSession();

    expect(mockedReissueOnce).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('existing-token');
  });

  it('토큰이 없으면 refresh 쿠키로 복원한다 (Safari ITP가 localStorage를 지운 경우)', async () => {
    mockedReissueOnce.mockImplementation(async () => {
      setAccessToken('restored-token');
      return 'restored-token';
    });

    await restoreSession();

    expect(getAccessToken()).toBe('restored-token');
    expect(useAuthStore.getState().isRestoringSession).toBe(false);
  });

  it('복원에 성공하면 그 사이 게스트로 받아온 캐시를 버린다', async () => {
    queryClient.setQueryData(['home', 'header'], { userName: '게스트' });
    mockedReissueOnce.mockImplementation(async () => {
      setAccessToken('restored-token');
      return 'restored-token';
    });

    await restoreSession();

    expect(queryClient.getQueryData(['home', 'header'])).toBeUndefined();
  });

  it('복원에 실패하면 조용히 게스트로 남는다 (에러를 던지지 않는다)', async () => {
    mockedReissueOnce.mockRejectedValue(new Error('401'));

    await expect(restoreSession()).resolves.toBeUndefined();

    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().isRestoringSession).toBe(false);
  });

  it('복원에 실패해도 게스트가 받아둔 캐시는 그대로 둔다', async () => {
    queryClient.setQueryData(['home', 'header'], { userName: '게스트' });
    mockedReissueOnce.mockRejectedValue(new Error('401'));

    await restoreSession();

    expect(queryClient.getQueryData(['home', 'header'])).toEqual({ userName: '게스트' });
  });
});
