import { describe, expect, it } from 'vitest';

import { CategorySajuReportResponse } from './report';

describe('CategorySajuReportResponse', () => {
  it('parses the general detail response', () => {
    expect(
      CategorySajuReportResponse.parse({
        reportId: 2,
        category: 'GENERAL',
        detail: {
          coreSummary: '변화에 잘 적응하지만 자주 혼란을 느끼는 경향이 있습니다.',
          primaryElements: ['EARTH', 'METAL'],
          dayPillars: {
            dayStem: {
              label: '일간',
              displayText: '丙(병)',
              description: '열정적이고 활력이 넘칩니다.',
            },
            dayBranch: {
              label: '일지',
              displayText: '申(신)',
              description: '깊은 감정을 숨기고 있습니다.',
            },
            dayPillar: {
              label: '일주',
              displayText: '丙申',
              description: '체계적으로 의사 결정을 내립니다.',
            },
          },
          flowAnalysis: [{ label: '감정 흐름', text: '표현을 주저하는 측면이 있습니다.' }],
        },
        complementActionGuide: {
          element: 'WOOD',
          label: '목',
          actions: [{ order: 1, type: '시작', text: '배우고 싶은 것을 찾아봐요' }],
        },
      }),
    ).toMatchObject({ reportId: 2, category: 'GENERAL' });
  });

  it('parses a category detail response', () => {
    expect(
      CategorySajuReportResponse.parse({
        reportId: 2,
        category: 'LOVE',
        detail: {
          code: 'LOVE',
          title: '연애',
          coreSummary: '연애에서는 감정의 깊이를 중요시합니다.',
          contentBlocks: [{ title: '사랑을 시작하는 방식', content: '관찰 후 행동합니다.' }],
          keyPoints: [{ label: '강점', text: '깊은 연결을 원합니다.' }],
        },
      }),
    ).toMatchObject({ reportId: 2, category: 'LOVE' });
  });
});
