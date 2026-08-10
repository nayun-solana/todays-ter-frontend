import { describe, expect, it } from 'vitest';

import { vi } from 'vitest';

vi.mock('../../api/search', () => ({
  getEditorPicks: vi.fn(),
  getExploreFilters: vi.fn(),
  getPlaces: vi.fn(),
}));

import { getNextPlacePage } from './useSearch';
import type { PlaceListResponse } from '../../types/search/search';

function placePage(number: number, hasNext: boolean): PlaceListResponse {
  return {
    appliedFilters: {
      keyword: null,
      regionCode: null,
      themeType: null,
      elementType: null,
    },
    content: [],
    page: {
      number,
      size: 10,
      totalElements: hasNext ? 20 : 10,
      totalPages: hasNext ? 2 : 1,
      hasNext,
    },
  };
}

describe('getNextPlacePage', () => {
  it('returns the next page only while the API says another page exists', () => {
    expect(getNextPlacePage(placePage(0, true))).toBe(1);
    expect(getNextPlacePage(placePage(1, false))).toBeUndefined();
  });
});
