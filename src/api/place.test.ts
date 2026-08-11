import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import axiosInstance from './axiosInstance';
import { getPlaceDetail, updatePlaceBookmark } from './place';

const mockedGet = vi.mocked(axiosInstance.get);
const mockedPatch = vi.mocked(axiosInstance.patch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPlaceDetail', () => {
  it('장소 상세 응답의 mapUrl을 파싱한다', async () => {
    mockedGet.mockResolvedValue({
      data: {
        isSuccess: true,
        code: 'COMMON200',
        message: '성공적으로 요청을 처리했습니다.',
        result: {
          placeId: 42,
          placeName: '오늘의 터',
          imageUrl: 'https://example.com/place.jpg',
          element: '토',
          hashtags: ['카페'],
          description: { question: '어떤 터인가요?', answer: '편안한 터예요.' },
          address: '서울시 중구 세종대로 1',
          latitude: 37.5665,
          longitude: 126.978,
          mapUrl: 'https://map.naver.com/p/entry/place/42',
          reviewCount: 0,
          isSaved: false,
          isVisited: false,
        },
      },
    } as never);

    await expect(getPlaceDetail('42')).resolves.toMatchObject({
      placeId: 42,
      mapUrl: 'https://map.naver.com/p/entry/place/42',
    });

    expect(mockedGet).toHaveBeenCalledWith('/places/42');
  });
});

describe('updatePlaceBookmark', () => {
  it('장소 저장 상태를 PATCH 요청으로 변경하고 서버 확정값을 반환한다', async () => {
    mockedPatch.mockResolvedValue({
      data: {
        isSuccess: true,
        code: 'COMMON200',
        message: '성공적으로 요청을 처리했습니다.',
        result: { placeId: 42, isSaved: true },
      },
    } as never);

    await expect(updatePlaceBookmark('42', true)).resolves.toEqual({
      placeId: 42,
      isSaved: true,
    });

    expect(mockedPatch).toHaveBeenCalledWith('/places/42/bookmark', { isSaved: true });
  });

  it('저장 해제 요청도 같은 엔드포인트에 isSaved=false로 보낸다', async () => {
    mockedPatch.mockResolvedValue({
      data: {
        isSuccess: true,
        code: 'COMMON200',
        message: '성공적으로 요청을 처리했습니다.',
        result: { placeId: 42, isSaved: false },
      },
    } as never);

    await updatePlaceBookmark('42', false);

    expect(mockedPatch).toHaveBeenCalledWith('/places/42/bookmark', { isSaved: false });
  });
});
