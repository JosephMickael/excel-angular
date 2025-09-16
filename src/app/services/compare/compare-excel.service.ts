import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  private apiUrl = environment.apiUrl;

  private result: any[] = [];

  constructor(private http: HttpClient) { }

  compareFiles(file1: File, file2: File, file3?: File): Observable<any> {
    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);
    if (file3) {
      formData.append("file3", file3);
    }
    return this.http.post(`${this.apiUrl}/compare`, formData);
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
