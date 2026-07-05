import { useNavigate } from 'react-router';

import Button from '../components/Button';
import { OHAENG_LIST } from '../lib/ohaeng';

// ponytail: 화면 확인용 임시 페이지. PR 전 라우트와 함께 삭제.
const PAGES = [
  { label: '홈', path: '/home' },
  { label: '탐색', path: '/search' },
  { label: '방문 기록 (지도/특징/후기)', path: '/record' },
  { label: '마이', path: '/my' },
  { label: '온보딩', path: '/onboarding' },
  { label: '장소 상세 (mock id)', path: '/place/test-1' },
];

export default function TestPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-[390px] flex-col gap-3 p-5">
      <h1 className="font-sans text-xl font-extrabold text-gray-6">화면 테스트</h1>

      {PAGES.map((page) => (
        <Button key={page.path} fullWidth onClick={() => navigate(page.path)}>
          {page.label}
        </Button>
      ))}

      <p className="mt-2 font-sans text-sm font-bold text-gray-6">탐색 · 오행별 선택</p>
      <div className="flex gap-2">
        {OHAENG_LIST.map((meta) => (
          <Button
            key={meta.key}
            fullWidth
            className={meta.bg}
            onClick={() => navigate(`/search?element=${meta.key}`)}
          >
            {meta.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
