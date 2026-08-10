import { ArrowLeft, ChevronRight, Share2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import Button from '../../components/Button';

const CATEGORIES = ['종합', '연애', '커리어', '재물', '인간관계', '건강'] as const;

const CORE_INFO = [
  { label: '일간', value: '계(癸)', description: '지혜롭고\n유연함' },
  { label: '일지', value: '子(자)', description: '감정적이고\n내면이 풍부함' },
  { label: '일주', value: '壬子', description: '흐르는 물처럼\n유연한 기운' },
];

const FLOW_ANALYSIS = [
  ['감정 흐름', '감정을 깊게 처리하며 혼자만의 시간에서 에너지를 얻어요.'],
  ['관계 패턴', '소수의 깊은 관계를 선호하고, 신뢰가 쌓이면 깊은 유대를 형성해요.'],
  ['행동 스타일', '충분히 생각한 뒤 움직여요. 결정 후에는 묵묵히 실행해요.'],
  ['회복 포인트', '물이나 자연 가까운 조용한 공간에서 빠르게 에너지를 회복해요.'],
] as const;

const RECOMMENDATIONS = [
  '탁 트인 전망 공간 방문하기',
  '노을/야경 보러 가기',
  '활기 있는 공간에 머물기',
];

export default function ReportDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isMyReport = searchParams.get('from') === 'my';
  const reportPath = `/report/${id}${isMyReport ? '?from=my' : ''}`;

  const handleShare = () => {
    if (!navigator.share) return;
    void navigator.share({ title: '오늘의 터 상세 분석' }).catch(() => undefined);
  };

  return (
    <div className="min-h-dvh bg-primary-bg pb-20 text-gray-6">
      <header className="bg-primary pt-safe text-white">
        <div className="flex h-15 items-center justify-between px-5">
          <button
            type="button"
            aria-label="기본 리포트로 돌아가기"
            onClick={() => navigate(reportPath)}
            className="flex size-8 items-center justify-center"
          >
            <ArrowLeft size={24} strokeWidth={2} aria-hidden />
          </button>
          <h1 className="typo-head-4">상세 분석</h1>
          <button
            type="button"
            aria-label="상세 분석 공유하기"
            onClick={handleShare}
            className="flex size-8 items-center justify-center"
          >
            <Share2 size={21} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </header>

      <nav aria-label="상세 분석 유형" className="flex gap-1 overflow-x-auto px-5 py-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            aria-current={category === '종합' ? 'page' : undefined}
            className={
              category === '종합'
                ? 'typo-body-4 shrink-0 rounded-full bg-primary px-4 py-2 text-white'
                : 'typo-body-4 shrink-0 rounded-full bg-white px-4 py-2 text-gray-4 shadow-[0_1px_3px_rgba(24,24,27,0.08)]'
            }
          >
            {category}
          </button>
        ))}
      </nav>

      <main className="flex flex-col gap-3 px-5 pb-5">
        <section className="rounded-[20px] bg-primary px-5 py-5 text-white shadow-card">
          <p className="typo-sub-3 text-primary-light">핵심 요약</p>
          <p className="typo-body-3 mt-3">
            &quot;생각은 깊고 감정은 섬세하지만,
            <br />
            실행의 타이밍에서는 망설임이 생기기 쉬워요&quot;
          </p>
          <span className="typo-body-4 mt-3 inline-flex rounded-full border border-white px-3 py-1.5">
            주 오행 : 수&nbsp;💧
          </span>
        </section>

        <section className="rounded-[20px] bg-white p-5 shadow-card">
          <h2 className="typo-head-4">일간 · 일지 · 일주</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {CORE_INFO.map((item) => (
              <article key={item.label} className="rounded-[18px] bg-gray-2 px-3 py-3">
                <p className="typo-sub-3 text-primary-light">{item.label}</p>
                <p className="typo-head-4 mt-2 text-primary">{item.value}</p>
                <p className="typo-sub-3 mt-2 whitespace-pre-line text-gray-4">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-5 shadow-card">
          <h2 className="typo-head-4">기본 흐름 분석</h2>
          <div className="mt-4 flex flex-col gap-3">
            {FLOW_ANALYSIS.map(([title, description]) => (
              <div key={title}>
                <p className="typo-sub-3 text-primary">{title}</p>
                <p className="typo-sub-3 mt-1 text-gray-5">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-ohaeng-fire bg-white p-5 shadow-card">
          <h2 className="typo-head-4 text-ohaeng-fire">부족한 화(火)를 채우기 위해</h2>
          <span className="typo-body-4 mt-3 inline-flex rounded-full border border-ohaeng-fire px-3 py-1.5 text-ohaeng-fire">
            보완 할 오행 : 화&nbsp;🔥
          </span>
          <ol className="mt-3 flex flex-col gap-2">
            {RECOMMENDATIONS.map((recommendation, index) => (
              <li
                key={recommendation}
                className="typo-body-3 flex items-center gap-3 rounded-btn bg-ohaeng-fire/20 px-3 py-2 text-gray-6"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ohaeng-fire text-white">
                  {index + 1}
                </span>
                {recommendation}
              </li>
            ))}
          </ol>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-primary-bg/90 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
        <div className="mx-auto max-w-[390px]">
          <Button
            onClick={() => navigate(isMyReport ? '/my/concerns' : '/onboarding/step-3')}
            className="gap-2"
          >
            {isMyReport ? '고민유형 수정하기' : '고민 유형 선택하기'}
            <ChevronRight size={16} strokeWidth={2} aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
