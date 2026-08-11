import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

import axiosInstance from './axiosInstance';
import { getMyPage } from './my';

const mockedAxios = vi.mocked(axiosInstance);

const responseWith = (result: unknown) => ({
  data: {
    isSuccess: true,
    code: 'COMMON200',
    message: '성공적으로 요청을 처리했습니다.',
    result,
  },
});

beforeEach(() => vi.clearAllMocks());

describe('my page API', () => {
  it('gets the profile and current report id from /mypage', async () => {
    const result = {
      reportId: 83721,
      nickname: '사용자닉네임',
      profileImageUrl: 'https://example.com/profile.png',
    };
    mockedAxios.get.mockResolvedValue(responseWith(result));

    await expect(getMyPage()).resolves.toEqual(result);
    expect(mockedAxios.get).toHaveBeenCalledWith('/mypage');
  });
});
