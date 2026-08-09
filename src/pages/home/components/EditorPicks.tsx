import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

import OhaengOrb from '../../../components/OhaengOrb';
import { useEditorPicks } from '../../../hooks/search/useSearch';
import { cn } from '../../../lib/cn';
import { ohaengByKey } from '../../../lib/ohaeng';
import { toOhaengKey } from '../../../types/home/homeEnergy';

/**
 * 홈 하단 '에디터 오행 픽'. (Figma 2349:2783)
 *
 * 원래 탐색 화면에 있던 섹션을 시안대로 홈으로 옮기면서 컴포넌트로 분리했다.
 * 데이터 레이어(`useEditorPicks` = `GET /places/editor-picks`)는 탐색에서 쓰던 것을 그대로 쓴다.
 */
export default function EditorPicks() {
  const navigate = useNavigate();
  const editorPicksQuery = useEditorPicks();

  const picks =
    editorPicksQuery.data?.content.map((pick) => ({
      id: String(pick.placeId),
      name: pick.placeName,
      course: pick.summary,
      description: pick.description,
      element: toOhaengKey(pick.element.code),
    })) ?? [];

  return (
    // 좌우 여백·섹션 간격은 홈 래퍼(px-5 + gap-8)가 준다. 여기서 또 주면 카드가 좁아진다.
    <section>
      <h2 className="typo-body-2 text-gray-6">에디터 오행 픽</h2>
      <div className="mt-3 flex flex-col gap-2">
        {editorPicksQuery.isPending ? (
          <p className="typo-sub-2 py-4 text-gray-4">에디터 픽을 불러오는 중입니다.</p>
        ) : editorPicksQuery.isError ? (
          <p className="typo-sub-2 py-4 text-gray-4">에디터 픽을 불러오지 못했습니다.</p>
        ) : picks.length === 0 ? (
          <p className="typo-sub-2 py-4 text-gray-4">등록된 에디터 픽이 없습니다.</p>
        ) : (
          picks.map((pick) => {
            const meta = ohaengByKey(pick.element)!;
            return (
              <button
                key={pick.id}
                type="button"
                onClick={() => navigate(`/place/${pick.id}`)}
                className="flex h-20 items-center justify-between gap-3 rounded-btn bg-white px-4 py-3.5 text-left shadow-card"
              >
                {/* min-w-0 — flex 자식은 기본이 min-width:auto라 이게 없으면 줄임표가 걸리지 않고
                    긴 텍스트가 카드를 밀어 늘린다(실데이터는 설명이 2~3줄이다. 목은 한 줄이라
                    로컬에서는 재현되지 않는다). */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <OhaengOrb element={meta.key} size={36} />
                  <div className="flex min-w-0 flex-col justify-center gap-2">
                    <p className="flex min-w-0 items-center gap-1.5">
                      {/* 시안은 black1(#222) — 프로젝트 최근접 토큰인 gray-6(#18181b)로 맞춘다. */}
                      <span className="truncate text-sm leading-4 font-bold text-gray-6">
                        {pick.name}
                      </span>
                      <span
                        aria-hidden="true"
                        className="size-[2px] shrink-0 rounded-full bg-gray-3"
                      />
                      <span className="shrink-0 text-[10px] leading-[14px] font-normal text-gray-4">
                        {pick.course}
                      </span>
                    </p>
                    {/* 설명만 오행 색을 쓴다 — 카드 배경은 흰색이다(탐색에 있던 오행색 배경과 다름).
                        시안은 한 줄 기준이라 넘치면 자른다. */}
                    <p className={cn('truncate text-xs leading-4 font-bold', meta.text)}>
                      {pick.description}
                    </p>
                  </div>
                </div>
                {/* 공용 icon-chevron-right.svg는 stroke가 흰색이라 흰 카드에서 안 보인다.
                    시안 색(gray-3)을 쓰려면 색을 입힐 수 있는 아이콘이어야 한다. */}
                <ChevronRight className="size-6 shrink-0 text-gray-3" strokeWidth={2} />
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
