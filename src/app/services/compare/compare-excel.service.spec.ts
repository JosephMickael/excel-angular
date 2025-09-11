import { TestBed } from '@angular/core/testing';

import { ComparisonService } from './compare-excel.service';

describe('CompareExcelService', () => {
  let service: ComparisonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComparisonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
