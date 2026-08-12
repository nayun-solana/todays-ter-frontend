import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

import axiosInstance from './axiosInstance';
import { getCurrentFortuneReport } from './report';

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

describe('current fortune report API', () => {
  it('gets the current member report id', async () => {
    const result = { reportId: 102 };
    mockedAxios.get.mockResolvedValue(responseWith(result));

    await expect(getCurrentFortuneReport()).resolves.toEqual(result);
    expect(mockedAxios.get).toHaveBeenCalledWith('/fortune-reports/me');
  });
});
