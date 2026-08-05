// libraries
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
// hooks
// import { useGetCategorySajuReport } from '../../hooks/onboarding/useGetReport';
//type
import type { CategorySajuReportResponse } from '../../types/onboarding/report';
// asstets
import lefe_arrow from '../../assets/onboarding/left-arrow.svg';
import share from '../../assets/onboarding/share.svg';
// components

const STATUS_BAR_COLOR = '#5a81fa';

export default function ReportDetailPage() {
  const navigate = useNavigate();

  // status bar 색상 변경 (iOS Safari, Android Chrome)
  useEffect(() => {
    const existingThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    const themeColor = existingThemeColor ?? document.createElement('meta');

    const wasThemeColorCreated = !existingThemeColor;
    const previousThemeColor = themeColor.getAttribute('content');

    const previousHtmlBackground = document.documentElement.style.backgroundColor;
    const previousBodyBackground = document.body.style.backgroundColor;

    if (wasThemeColorCreated) {
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }

    themeColor.setAttribute('content', STATUS_BAR_COLOR);
    document.documentElement.style.backgroundColor = STATUS_BAR_COLOR;
    document.body.style.backgroundColor = STATUS_BAR_COLOR;

    return () => {
      if (wasThemeColorCreated) {
        themeColor.remove();
      } else if (previousThemeColor !== null) {
        themeColor.setAttribute('content', previousThemeColor);
      } else {
        themeColor.removeAttribute('content');
      }

      document.documentElement.style.backgroundColor = previousHtmlBackground;

      document.body.style.backgroundColor = previousBodyBackground;
    };
  }, []);

  const detailReportData = {
    reportId: 1,
    category: 'GENERAL',
    summary: {
      description: '생각은 깊고 감정은 섬세하지만, 실행의 타이밍에서는 망설임이 생기기 쉬워요.',
      primaryElement: 'WATER',
    },
    sajuCore: [
      {
        type: 'DAY_STEM',
        title: '일간',
        value: '계(癸)',
        description: '지혜롭고 유연함',
        displayOrder: 1,
      },
      {
        type: 'DAY_BRANCH',
        title: '일지',
        value: '자(子)',
        description: '감정적이고 내면이 풍부함',
        displayOrder: 2,
      },
      {
        type: 'DAY_PILLAR',
        title: '일주',
        value: '계자',
        description: '흐르는 물처럼 유연한 기운',
        displayOrder: 3,
      },
    ],
    flowAnalysis: [
      {
        type: 'EMOTIONAL_FLOW',
        title: '감정 흐름',
        description: '감정을 깊게 처리하며 혼자만의 시간에 에너지를 얻어요.',
        displayOrder: 1,
      },
      {
        type: 'RELATIONSHIP_PATTERN',
        title: '관계 패턴',
        description: '소수의 깊은 관계를 선호하고, 신뢰가 쌓이면 깊은 유대를 형성해요.',
        displayOrder: 2,
      },
      {
        type: 'ACTION_STYLE',
        title: '행동 스타일',
        description: '충분히 생각한 뒤 움직이며, 결정 후에는 묵묵히 실천해요.',
        displayOrder: 3,
      },
      {
        type: 'RECOVERY_POINT',
        title: '회복 포인트',
        description: '물이나 자연과 가까운 조용한 공간에서 빠르게 에너지를 회복해요.',
        displayOrder: 4,
      },
    ],
    complementaryElement: 'FIRE',
    recommendations: [
      {
        description: '탁 트인 전망 공간 방문하기',
        displayOrder: 1,
      },
      {
        description: '노을이나 야경 보러 가기',
        displayOrder: 2,
      },
      {
        description: '활기 있는 공간에 머물기',
        displayOrder: 3,
      },
    ],
  } satisfies CategorySajuReportResponse;

  return (
    <div>
      <div className="flex items-center justify-between bg-primary h-13 w-full text-white typo-body-3 px-5">
        <img src={lefe_arrow} alt="뒤로가기" onClick={() => window.history.back()} />
        상세 분석
        <img src={share} alt="공유하기" />
      </div>
      <div></div>
      <div></div>
    </div>
  );
}
