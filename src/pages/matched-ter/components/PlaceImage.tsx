import { useState } from 'react';

interface PlaceImageProps {
  /**
   * `GET /recommendations/places/{placeId}`의 `imageUrl`.
   * 없을 수도 있고(nullish), 링크가 죽어 있을 수도 있다 — 둘 다 플레이스홀더로 떨어진다.
   */
  imageUrl?: string | null;
  /** 대체 텍스트에 쓸 장소 이름. */
  placeName: string;
}

/**
 * 추천 상세 상단 장소 이미지.
 *
 * 예전에는 이 자리가 회색 박스로 하드코딩돼 있어서 응답에 `imageUrl`이 와도 화면에 뜨지 않았다.
 * BE가 주는 이미지는 **한 장**이라(스펙상 `imageUrl: string`) 캐러셀이 아니다 —
 * 넘길 게 없는데 인디케이터 점을 3개 그리면 더 있는 것처럼 보인다.
 */
export default function PlaceImage({ imageUrl, placeName }: PlaceImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  if (!imageUrl || hasFailed) {
    return <div className="h-[220px] w-full rounded-2xl bg-gray-3" />;
  }

  return (
    <img
      src={imageUrl}
      alt={placeName}
      loading="lazy"
      onError={() => setHasFailed(true)}
      className="h-[220px] w-full rounded-2xl bg-gray-3 object-cover"
    />
  );
}
