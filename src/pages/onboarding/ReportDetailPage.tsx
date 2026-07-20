export default function ReportDetailPage() {
  const data = {
    reportId: 'report_12345',
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
  };
  return <div></div>;
}
