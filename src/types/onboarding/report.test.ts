import { describe, expect, it } from 'vitest';

import { CurrentReportResponse } from './report';

describe('CurrentReportResponse', () => {
  it('parses the current member report id', () => {
    expect(CurrentReportResponse.parse({ reportId: 102 })).toEqual({ reportId: 102 });
  });
});
