import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./axiosInstance', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

import axiosInstance from './axiosInstance';
import {
  getMemberConcerns,
  getMemberInfo,
  isMemberOnboardingMissing,
  updateMemberConcerns,
} from './my';

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

describe('member info API', () => {
  it('reads the nickname from /members/me', async () => {
    const result = {
      memberId: 7,
      email: 'someone@example.com',
      nickname: '사용자닉네임',
      status: 'ACTIVE',
    };
    mockedAxios.get.mockResolvedValue(responseWith(result));

    await expect(getMemberInfo()).resolves.toEqual(result);
    expect(mockedAxios.get).toHaveBeenCalledWith('/members/me');
  });
});

describe('member concerns API', () => {
  it('reads the saved concern types from /members/me/concerns', async () => {
    mockedAxios.get.mockResolvedValue(responseWith({ concernTypes: ['LOVE', 'HEALTH'] }));

    await expect(getMemberConcerns()).resolves.toEqual({ concernTypes: ['LOVE', 'HEALTH'] });
    expect(mockedAxios.get).toHaveBeenCalledWith('/members/me/concerns');
  });

  it('rejects a concern type the contract does not define', async () => {
    mockedAxios.get.mockResolvedValue(responseWith({ concernTypes: ['MONEY'] }));

    await expect(getMemberConcerns()).rejects.toThrow();
  });

  it('빈 배열은 요청을 보내기 전에 막는다 — BE @NotEmpty 400을 일반 실패 문구로 뭉개지 않게', async () => {
    await expect(updateMemberConcerns({ concernTypes: [] })).rejects.toThrow();
    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  it('writes concern types with PUT — POST 는 계약에 없다', async () => {
    mockedAxios.put.mockResolvedValue(responseWith({ concernTypes: ['CAREER'] }));

    await expect(updateMemberConcerns({ concernTypes: ['CAREER'] })).resolves.toEqual({
      concernTypes: ['CAREER'],
    });
    expect(mockedAxios.put).toHaveBeenCalledWith('/members/me/concerns', {
      concernTypes: ['CAREER'],
    });
  });
});

describe('isMemberOnboardingMissing', () => {
  // 이 판정이 틀리면 "잠시 후 다시 시도해주세요"를 띄우는데, 실제로는 영영 404다.
  it('회원에게 연결된 온보딩이 없다는 404만 참으로 본다', () => {
    expect(isMemberOnboardingMissing({ status: 404, code: 'MEMBER404_3' })).toBe(true);
  });

  it('다른 404·다른 코드·비객체는 거짓', () => {
    expect(isMemberOnboardingMissing({ status: 404, code: 'MEMBER404_1' })).toBe(false);
    expect(isMemberOnboardingMissing({ status: 400, code: 'MEMBER404_3' })).toBe(false);
    expect(isMemberOnboardingMissing(new Error('network'))).toBe(false);
    expect(isMemberOnboardingMissing(null)).toBe(false);
    expect(isMemberOnboardingMissing(undefined)).toBe(false);
  });
});
