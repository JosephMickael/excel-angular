import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DuplicatesExcelService } from '../../../services/duplicates/duplicates-excel.service';
import { PaginationServiceService } from '../../../services/pagination/pagination-service.service';
import { SearchService } from '../../../services/search/search.service';

@Component({
  selector: 'app-duplicates-excel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './duplicates-excel.component.html',
  styleUrl: './duplicates-excel.component.css'
})
export class DuplicatesExcelComponent implements OnInit {

  file: File | null = null;
  fileName: string | null = null;
  isLoading = false;

  duplicates: any[] = [];
  filteredDuplicates: any[] = [];
  opened: boolean[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;
  visiblePages: (number | string)[] = [];

  // Recherche
  searchQuery = '';

  // Filtres
  sortKey: string = ''; // 'matricule' ou 'nom_prenom'
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private duplicatesService: DuplicatesExcelService,
    private paginationService: PaginationServiceService,
    private searchService: SearchService
  ) { }

  ngOnInit(): void {
    this.syncFiltered();
  }

  onChevronClick(index: number, ev: Event) {
    ev.stopPropagation();
    this.opened[index] = !this.opened[index];
  }

  onSearchChange() {
    this.filteredDuplicates = this.searchService.filter(this.duplicates, this.searchQuery, [
      'matricule', 'nom_prenom', 'date_naissance', 'id_personne', 'employeur', 'departement'
    ]);
    this.currentPage = 1;
    this.opened = [];
    this.applySort();
    this.updatePagination();
  }

  private syncFiltered() {
    this.filteredDuplicates = [...this.duplicates];
    this.currentPage = 1;
    this.opened = [];
    this.updatePagination();
  }

  // --- Pagination ---

  updatePagination() {
    const total = this.filteredDuplicates.length;
    this.totalPages = Math.ceil(total / this.pageSize) || 1;
    this.visiblePages = this.paginationService.getVisiblePages(this.currentPage, this.totalPages);
  }

  changePage(page: number | string) {
    if (page === '...') return;
    const p = Number(page);
    if (Number.isNaN(p)) return;
    this.currentPage = Math.max(1, Math.min(this.totalPages, p));
    this.opened = [];
    this.updatePagination();
  }

  getPaginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDuplicates.slice(start, start + this.pageSize);   // <-- afficher filtré
  }

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.file = file;
      this.fileName = file.name;
    }
  }

  submitDuplicates() {
    if (!this.file) return;
    this.isLoading = true;

    this.duplicatesService.showDuplicates(this.file).subscribe({
      next: (result: any) => {
        this.duplicates = result?.duplicates || [];
        this.searchQuery = '';
        this.syncFiltered();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // Tri
  applySort() {
    if (!this.sortKey) return;

    this.filteredDuplicates.sort((a, b) => {
      let valA = a[this.sortKey];
      let valB = b[this.sortKey];

      // Si c’est un matricule → trier comme nombre
      if (this.sortKey === 'matricule') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }

  changeSort(key: string) {
    if (this.sortKey === key) {
      // Inverser la direction si on clique deux fois sur la même colonne
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    if (value.includes('T')) return value.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(value)) return value.split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return value;
  }
}
