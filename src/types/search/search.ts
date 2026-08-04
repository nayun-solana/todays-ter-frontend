import { z } from 'zod';

import { ElementCode } from '../home/homeEnergy';

const ElementFilterCode = z.union([z.literal('ALL'), ElementCode]);
export const RegionCode = z.enum(['SEOUL', 'JEJU', 'BUSAN', 'GANGWON', 'CAPITAL_AREA']);
export type RegionCode = z.infer<typeof RegionCode>;
export const ThemeType = z.enum(['LOVE', 'CAREER', 'WEALTH', 'RELATIONSHIP', 'HEALTH', 'ETC']);
export type ThemeType = z.infer<typeof ThemeType>;
const NamedCode = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
});
const Element = z.object({
  code: ElementCode,
  name: z.string().min(1),
});

export const ExploreFiltersResponse = z.object({
  regions: z.array(
    NamedCode.extend({
      displayOrder: z.number().int(),
    }),
  ),
  themes: z.array(
    NamedCode.extend({
      placeCount: z.number().int().nonnegative(),
      displayOrder: z.number().int(),
    }),
  ),
  elements: z.array(
    z.object({
      code: ElementFilterCode,
      name: z.string().min(1),
      displayOrder: z.number().int(),
    }),
  ),
});
export type ExploreFiltersResponse = z.infer<typeof ExploreFiltersResponse>;

export const PlaceListResponse = z.object({
  appliedFilters: z.object({
    keyword: z.string().nullable(),
    regionCode: z.string().nullable(),
    themeType: z.string().nullable(),
    elementType: ElementCode.nullable(),
  }),
  content: z.array(
    z.object({
      placeId: z.number().int().positive(),
      placeName: z.string().min(1),
      thumbnailUrl: z.string().url().nullable(),
      summary: z.string(),
      element: Element,
      theme: NamedCode,
      averageRating: z.number().min(0).max(5),
      distanceKm: z.number().nonnegative().nullable(),
    }),
  ),
  page: z.object({
    number: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNext: z.boolean(),
  }),
});
export type PlaceListResponse = z.infer<typeof PlaceListResponse>;

export const EditorPicksResponse = z.object({
  content: z.array(
    z.object({
      placeId: z.number().int().positive(),
      placeName: z.string().min(1),
      thumbnailUrl: z.string().url().nullable(),
      summary: z.string(),
      description: z.string(),
      element: Element,
      theme: NamedCode,
      averageRating: z.number().min(0).max(5),
    }),
  ),
});
export type EditorPicksResponse = z.infer<typeof EditorPicksResponse>;

export type PlaceListParams = {
  keyword?: string;
  regionCode?: RegionCode;
  themeType?: ThemeType;
  elementType?: z.infer<typeof ElementCode>;
  latitude?: number;
  longitude?: number;
  page?: number;
  size?: number;
};
