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
  file3: File | undefined;

  file1Name: string | null = null;
  file2Name: string | null = null;
  file3Name: string | null = null;

  isLoading = false;

  missingInDf1: any[] = [];
  missingInDf2: any[] = [];
  sameNameDiffMatricule: any;

  tabs: any[] = []; // pour la nav tabs

  pageSize = 50;   // nombre de lignes par page
  currentPage = 1;

  groupedDiffs: any[] = [];
  pagedDiffs: any[] = [];

  presenceMatrix: any[] = [];

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

  onFile3Change(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.file3 = file;
      this.file3Name = file.name;
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

    this.comparisonService.compareFiles(this.file1, this.file2, this.file3).subscribe({
      next: (result: any) => {
        console.log("Réponse API :", result);

        this.results = result.report;

        // vide les anciens onglets
        this.tabs = [];

        const report = result.report;

        console.log("Missing df1 :", report.missing_in_df1);
        console.log("Missing df2 :", report.missing_in_df2);
        console.log("Missing df3 :", report.missing_in_df3);

        // Same
        if (report.same_name_diff_matricule?.length) {
          this.tabs.push({
            id: 'same',
            title: 'Noms identiques / matricules différents',
            data: report.same_name_diff_matricule,
            type: 'same'
          });
        }


        // Pour les manquants 
        if (report.missing_in_df1?.length || report.missing_in_df2?.length || report.missing_in_df3?.length) {
          this.tabs.push({
            id: 'missing',
            title: 'Manquants',
            type: 'missing',
            data: {
              df1: this.simplifyMissing(report.missing_in_df1),
              df2: this.simplifyMissing(report.missing_in_df2),
              df3: this.simplifyMissing(report.missing_in_df3)
            }
          });
        }

        // Diff colonne / colonne
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

  getPagedData(tab: any, subKey?: string): any[] {
    if (!tab.data) return [];

    if (tab.type === 'missing' && subKey) {
      const arr = tab.data[subKey] || [];
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return arr.slice(start, end);
    }

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

  // Vérifie si "report" existe dans le retour API (JSON)
  isReportEmpty(report: any): boolean {
    return !report || Object.keys(report).length === 0;
  }

  // helpers pour la carte
  hasConflict(item: any): boolean {
    const sets = [item.df1, item.df2, item.df3]
      .filter(arr => arr && arr.length > 0)
      .map(arr => new Set(arr.map((x: any) => x.matricule)));
    return sets.length > 1 && !sets.every(s => JSON.stringify([...s]) === JSON.stringify([...sets[0]]));
  }

  hasDuplicates(item: any): boolean {
    return [item.df1, item.df2, item.df3].some(arr => arr && arr.length > 1);
  }



  // pour les manquants
  private simplifyMissing(arr: any[]): any[] {
    return (arr || []).map(x => ({
      nom_prenom: x.nom_prenom || "-",
      matricule: x.matricule || "-",
      date_naissance: x.date_naissance || x["date naissance"] || "-"
    }));
  }

}
