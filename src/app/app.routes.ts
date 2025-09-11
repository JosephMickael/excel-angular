import { Routes } from '@angular/router';
import { CompareComponent } from './gestion-excel/compare/compare.component';

export const routes: Routes = [
    { path: '', redirectTo: 'comparer', pathMatch: 'full' },
    { path: 'comparer', component: CompareComponent },
    { path: '**', redirectTo: '' }
];
