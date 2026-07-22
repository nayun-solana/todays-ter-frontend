export type ElementCode = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';

export type ReportType = 'BASIC';

export type OverallTendencyCode = 'EMOTION_THOUGHT' | 'CHOICE_ACTION' | 'RECOVERY';

export type ElementDistribution = {
  code: ElementCode;
  percentage: number;
};

export type ElementAnalysis = {
  summary: string;
  primaryElements: ElementCode[];
  complementaryElements: ElementCode[];
  distribution: ElementDistribution[];
};

export type OverallTendencyItem = {
  code: OverallTendencyCode;
  title: string;
  description: string;
  displayOrder: number;
};

export type OverallTendency = {
  title: string;
  items: OverallTendencyItem[];
};

export interface SajuReport {
  reportId: string;
  reportType: ReportType;
  headline: string;
  sajuTypeName: string;
  elementAnalysis: ElementAnalysis;
  overallTendency: OverallTendency;
}
