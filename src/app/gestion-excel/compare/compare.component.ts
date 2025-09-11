import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { ComparisonService } from '../../services/compare/compare-excel.service';
import { CommonModule } from '@angular/common';
import { PaginationServiceService } from '../../services/pagination/pagination-service.service';

@Component({
  selector: 'app-compare',
  imports: [CommonModule],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.css',
  providers: [ComparisonService]
})
export class CompareComponent implements OnInit {
  loading = false;
  results: any;

  file1: File | null = null;
  file2: File | null = null;

  file1Name: string | null = null;
  file2Name: string | null = null;

  isLoading = false;

  missingInDf1: any[] = [];
  missingInDf2: any[] = [];
  sameNameDiffMatricule: any;

  tabs: any[] = []; // pour la nav tabs

  pageSize = 50;   // nombre de lignes par page
  currentPage = 1;

  groupedDiffs: any[] = [];
  pagedDiffs: any[] = [];

  constructor(private comparisonService: ComparisonService, private paginationService: PaginationServiceService) { }

  ngOnInit() {
  }

  onFile1Change(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.file1 = file;
      this.file1Name = file.name; 
    }
  }

  onFile2Change(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.file2 = file;
      this.file2Name = file.name;
    }
  }

  // conversion en array de l'objet
  toArray(data: any): any {
    if (!data) return [];
    return Array.isArray(data) ? data : Object.values(data);
  }

  // vérifie si val est un array (utile dans html)
  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  async comparer() {
    if (!this.file1 || !this.file2) return;
    this.isLoading = true;

    this.comparisonService.compareFiles(this.file1, this.file2).subscribe({
      next: (result: any) => {
        console.log("Réponse API :", result);

        this.results = result.report;

        // vide les anciens onglets
        this.tabs = [];

        const report = result.report;

        // Same
        if (report.same_name_diff_matricule?.length) {
          this.tabs.push({
            id: 'same',
            title: 'Noms identiques / matricules différents',
            data: report.same_name_diff_matricule,
            type: 'same'
          });
        }

        // missing1
        if (report.missing_in_df1?.length) {
          this.tabs.push({
            id: 'missing1',
            title: 'Manquants dans ' + this.file1Name,
            data: report.missing_in_df1,
            type: 'missing1'
          });
        }

        // missing2
        if (report.missing_in_df2?.length) {
          this.tabs.push({
            id: 'missing2',
            title: 'Manquants dans ' + this.file2Name,
            data: report.missing_in_df2,
            type: 'missing2'
          });
        }

        if (report.diff_line_by_line?.length) {
          this.groupedDiffs = this.groupDiffsByKey(report.diff_line_by_line);
          this.updatePagedDiffs();
          this.tabs.push({
            id: 'diffs',
            title: 'Différences colonne par colonne',
            data: report.diff_line_by_line,
            type: 'diffs'
          });
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // Pagination
  getTotalPages(): number {
    if (!this.tabs || this.tabs.length === 0) return 0;
    const maxLength = Math.max(...this.tabs.map(t => t.data.length || 0));
    return Math.ceil(maxLength / this.pageSize);
  }

  getPagedData(tab: any): any[] {
    if (!tab.data) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return tab.data.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagedDiffs();
    }
  }

  // end pagination
  getVisiblePages(): (number | string)[] {
    return this.paginationService.getVisiblePages(this.currentPage, this.getTotalPages());
  }

  updatePagedDiffs() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedDiffs = this.groupedDiffs.slice(start, end);
  }


  groupDiffsByKey(differences: any[]): any[] {
    const map = new Map<string, any[]>();

    differences.forEach(diff => {
      if (!map.has(diff.key)) {
        map.set(diff.key, []);
      }
      map.get(diff.key)!.push(diff);
    });

    return Array.from(map.entries()).map(([key, diffs]) => ({
      key,
      differences: diffs
    }));
  }

  isReportEmpty(report: any): boolean {
    return !report || Object.keys(report).length === 0;
  }



}
