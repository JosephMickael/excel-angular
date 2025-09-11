import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DuplicatesExcelService {

  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  showDuplicates(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/detect_duplicates/`, formData);
  }
}
