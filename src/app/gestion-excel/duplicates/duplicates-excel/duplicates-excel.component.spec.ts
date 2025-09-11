import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicatesExcelComponent } from './duplicates-excel.component';

describe('DuplicatesExcelComponent', () => {
  let component: DuplicatesExcelComponent;
  let fixture: ComponentFixture<DuplicatesExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuplicatesExcelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuplicatesExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
