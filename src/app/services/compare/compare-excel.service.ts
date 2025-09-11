import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  private apiUrl = environment.apiUrl;

  private result: any[] = [];

  constructor(private http: HttpClient) { }

  compareFiles(file1: File, file2: File): Observable<any> {
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    return this.http.post<any>(`${this.apiUrl}/compare/`, formData);
  }

  setResult(data: any[]) {
    this.result = data;
  }

  getResult() {
    return this.result;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
