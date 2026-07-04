/** 나와 어울리는 터 이미지 캐러셀 — 시안은 회색 플레이스홀더(실 이미지 연동은 후속). */
export default function ImageCarousel() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-[220px] w-full rounded-2xl bg-gray-3" />
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-3 rounded-full bg-primary" />
        <span className="size-1.5 rounded-full bg-gray-3" />
        <span className="size-1.5 rounded-full bg-gray-3" />
      </div>
    </div>
  );
}
