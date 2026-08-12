import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

import axiosInstance from './axiosInstance';
import { getCategorySajuReport } from './report';

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

describe('fortune report API', () => {
  it('gets category detail with the required category query', async () => {
    const result = {
      reportId: 2,
      category: 'LOVE',
      detail: {
        code: 'LOVE',
        title: '연애',
        coreSummary: '연애에서는 감정의 깊이를 중요시합니다.',
        contentBlocks: [],
        keyPoints: [],
      },
    };
    mockedAxios.get.mockResolvedValue(responseWith(result));

    await expect(getCategorySajuReport({ reportId: 2, category: 'LOVE' })).resolves.toMatchObject(
      result,
    );
    expect(mockedAxios.get).toHaveBeenCalledWith('/fortune-reports/2/details', {
      params: { category: 'LOVE' },
    });
  });
});
