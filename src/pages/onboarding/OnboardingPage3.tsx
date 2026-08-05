// libraries
import { useState } from 'react';
import { useNavigate } from 'react-router';
// components
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import CategoryCard from './components/CategoryCard';

//assets
import num1 from '../../assets/onboarding/3-1.svg';
import num2 from '../../assets/onboarding/3-2.svg';
import num3 from '../../assets/onboarding/3-3.svg';
import num4 from '../../assets/onboarding/3-4.svg';
import num5 from '../../assets/onboarding/3-5.svg';
import num6 from '../../assets/onboarding/3-6.svg';

const CONCERN_ICONS = [num1, num2, num3, num4, num5, num6];

interface Concern {
  id: string;
  title: string;
  description: string;
}

const CONCERNS: Concern[] = [
  { id: 'love', title: '연애운', description: '사랑과 인연 찾기' },
  { id: 'career', title: '커리어운', description: '직장·취업·이직' },
  { id: 'wealth', title: '재물운', description: '돈·투자·사업' },
  { id: 'relationship', title: '인간관계', description: '친구·가족·동료' },
  { id: 'health', title: '건강운', description: '몸과 마음의 균형' },
  { id: 'etc', title: '기타', description: '그 외 고민들' },
];

/** 온보딩3 — 고민 유형 선택 (다중 선택). */
export default function OnboardingPage3() {
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  return (
    <div className="flex min-h-dvh w-full flex-col px-5 pb-8 pt-4">
      {/* 상단 진행바 — 시안은 3분할 세그먼트(2/3 채움)이나 크로스팟 ProgressBar(연속형)로 근사 */}
      <ProgressBar step={2} total={3} />

      <header className="mt-11 flex flex-col gap-4">
        <p className="text-base font-bold text-primary">고민 유형 선택</p>
        <div className="flex flex-col gap-2.5">
          <h1 className="text-2xl font-extrabold leading-8 text-gray-6">
            어떤 고민을
            <br />
            해결하고 싶나요?
          </h1>
          <p className="text-sm font-bold text-gray-5">원하는 항목을 모두 선택해주세요</p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-2.5">
        {CONCERNS.map((concern, index) => (
          <CategoryCard
            icon={CONCERN_ICONS[index]}
            key={concern.id}
            title={concern.title}
            description={concern.description}
            selected={selectedIds.includes(concern.id)}
            onClick={() => toggle(concern.id)}
          />
        ))}
      </div>

      <Button
        variant="primary"
        disabled={selectedIds.length === 0}
        className="mt-auto"
        onClick={() => {
          navigate('/home', { state: { selectedConcerns: selectedIds } });
        }}
      >
        오늘의 터 시작하기
      </Button>
    </div>
  );
}
