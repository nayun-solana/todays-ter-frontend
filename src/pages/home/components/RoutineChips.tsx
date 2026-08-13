interface RoutineChipsProps {
  title: string;
  routines: string[];
}

/** 홈 "에너지 루틴" 섹션 — 가로 스크롤 반투명 칩. */
export default function RoutineChips({ title, routines }: RoutineChipsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-extrabold text-gray-6">{title}</h2>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {routines.map((routine) => (
          <span
            key={routine}
            className="shrink-0 whitespace-nowrap rounded-[20px] bg-white/40 px-5 py-3 text-base font-bold text-gray-4 shadow-[0_0_5px_0_rgba(0,0,0,0.1)] my-2 mx-1"
          >
            {routine}
          </span>
        ))}
      </div>
    </section>
  );
}
