import { Routes } from '@angular/router';
import { CompareComponent } from './gestion-excel/compare/compare.component';
import { DuplicatesExcelComponent } from './gestion-excel/duplicates/duplicates-excel/duplicates-excel.component';

export const routes: Routes = [
    { path: '', redirectTo: 'comparer', pathMatch: 'full' },
    { path: 'comparer', component: CompareComponent },
    { path: 'doublons', component: DuplicatesExcelComponent },
    { path: '**', redirectTo: '' },
];
