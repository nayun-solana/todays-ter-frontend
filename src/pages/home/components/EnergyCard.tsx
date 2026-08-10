import OhaengOrb from '../../../components/OhaengOrb';
import type { OhaengKey } from '../../../lib/ohaeng';

interface EnergyCardProps {
  /** 오행 키 (오브 렌더용) */
  element: OhaengKey;
  /** 기운 글자 (수/토/화/목/금) */
  label: string;
  /** 기운 설명 (개행 포함) */
  desc: string;
}

/** 홈 "나의 기운" 카드 — 반투명 위에 오행 오브+설명. */
export default function EnergyCard({ element, label, desc }: EnergyCardProps) {
  return (
    <div className="flex w-full flex-col items-center gap-[30px] rounded-[20px] bg-white/40 px-5 py-6 shadow-[0_0_20px_0_rgba(0,0,0,0.1)]">
      <p className="text-lg font-extrabold text-gray-6">나의 기운</p>
      <div className="flex flex-col items-center gap-5">
        <OhaengOrb element={element} size={120} />
        <div className="flex flex-col items-center gap-2.5">
          <p className="text-lg font-extrabold text-gray-6">{label}</p>
          <p className="whitespace-pre-line text-center text-sm font-normal leading-5 text-gray-6">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}
