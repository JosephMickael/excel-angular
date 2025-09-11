import { TestBed } from '@angular/core/testing';

import { DuplicatesExcelService } from './duplicates-excel.service';

describe('DuplicatesExcelService', () => {
  let service: DuplicatesExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DuplicatesExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
