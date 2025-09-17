import { Component } from '@angular/core';
import { DuplicatesExcelService } from '../../../services/duplicates/duplicates-excel.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-duplicates-excel',
  imports: [CommonModule],
  templateUrl: './duplicates-excel.component.html',
  styleUrl: './duplicates-excel.component.css'
})
export class DuplicatesExcelComponent {

  file: File | null = null;
  fileName: string | null = null;

  isLoading: Boolean = false;

  duplicates: any[] = [];

  opened: boolean[] = [];

  onChevronClick(index: number, ev: Event) {
    ev.stopPropagation();
    this.opened[index] = !this.opened[index];
  }

  // toggleAccordion(index: number) {
  //   this.opened[index] = !this.opened[index];
  // }

  constructor(private duplicatesService: DuplicatesExcelService) { }

  onFileChange(event: any) {
    const file = event.target.files[0];
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
        console.log("Doublons ==>", result)

        this.duplicates = result.duplicates;

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    })
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';

    // Cas ISO : "1989-08-12T00:00:00"
    if (value.includes('T')) {
      return value.split('T')[0];
    }

    // Cas SQL-like : "1989-08-12 00:00:00"
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(value)) {
      return value.split(' ')[0];
    }

    // Cas simple "1989-08-12"
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    return value; // fallback : on affiche tel quel
  }

}
