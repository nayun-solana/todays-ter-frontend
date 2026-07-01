// src/pages/Onboarding/OnboardingPage3.tsx
// libraries
import { useState } from 'react';
// components
import BottomButton from '../../components/BottomButton';
import HeaderProgressBar from '../../components/HeaderProgressBar';
import SelectBtn from './components/SelectBtn';
// assets
import testImg from '../../assets/testImg.svg';

export default function OnboardingPage3() {
  const [selectedBtns, setSelectedBtns] = useState<number[]>([]);

  const btns = [
    {
      id: 1,
      img: testImg,
      title: '연애운',
      description: '사랑과 인연 찾기',
    },
    {
      id: 2,
      img: testImg,
      title: '커리어운',
      description: '직장·취업·이직',
    },
    {
      id: 3,
      img: testImg,
      title: '재물운',
      description: '돈·투자·사업',
    },
    {
      id: 4,
      img: testImg,
      title: '인간관계',
      description: '친구·가족·동료',
    },
    {
      id: 5,
      img: testImg,
      title: '건강운',
      description: '몸과 마음의 균형',
    },
    {
      id: 6,
      img: testImg,
      title: '기타',
      description: '그 외 고민들',
    },
  ];

  const handleSelectBtnClick = (btnId: number) => {
    setSelectedBtns((prevSelectedBtns) => {
      if (prevSelectedBtns.includes(btnId)) {
        return prevSelectedBtns.filter((id) => id !== btnId);
      } else {
        return [...prevSelectedBtns, btnId];
      }
    });
  };

  return (
    <div className="w-full min-h-screen mx-auto flex flex-col items-center justify-between">
      <HeaderProgressBar step={3} />
      <div className="flex flex-col items-start gap-4  self-start">
        <div className="text-[16px] font-bold text-[#5A81FA]">고민 유형 선택</div>
        <div className="flex flex-col items-start gap-2.5 text-start">
          <div className="text-[24px]/6.5 font-extrabold text-[#18181B]">
            어떤 고민을 <br /> 해결하고 싶나요?
          </div>
          <div className="text-[#3F3F46] text-[14px] font-bold">
            원하는 항목을 모두 선택해주세요
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 w-full mb-20">
        {btns.map((btn) => (
          <SelectBtn
            key={btn.id}
            id={btn.id}
            img={btn.img}
            title={btn.title}
            description={btn.description}
            isSelected={selectedBtns.includes(btn.id)}
            onClick={() => handleSelectBtnClick(btn.id)}
          />
        ))}
      </div>
      <BottomButton
        text="오늘의 터 시작하기"
        isAble={selectedBtns.length > 0}
        onClick={() => console.log('다음 버튼 클릭')}
      />
    </div>
  );
}
