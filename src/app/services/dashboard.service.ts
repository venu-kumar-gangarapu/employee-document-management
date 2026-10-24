import { Injectable } from "@angular/core";
import { Observable, of, map } from "rxjs";
import { ApiService } from "./api.service";
import { DashboardSummary, CountMap, ApiResponse, RecentDocument } from "../models/report.model";
import { employees, documents } from "../core/mock-data";
@Injectable({ providedIn: "root" })
export class DashboardService extends ApiService {
  summary(): Observable<DashboardSummary> {
    if (!this.mock) {
      return this.http
        .get<ApiResponse<DashboardSummary>>(`${this.base}/dashboard/summary`)
        .pipe(map((res) => res.data));
    }
    return of({
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "ACTIVE").length,
      inactiveEmployees: employees.filter((e) => e.status === "INACTIVE")
        .length,
      totalDocuments: documents.length,
      documentsThisMonth: documents.length,
    });
  }
  departments(): Observable<CountMap> {
    if (!this.mock)
      return this.http
        .get<any>(`${this.base}/dashboard/employees-by-department`)
        .pipe(map((res: any) => res?.data || res));
    return of(this.map());
  }
  recentEmployees(): Observable<any[]> {
    return this.mock
      ? of(employees.slice(0, 4))
      : this.http
          .get<any>(`${this.base}/recent-employees`)
          .pipe(map((res: any) => (Array.isArray(res) ? res : res?.data || [])));
  }
  recentDocuments(): Observable<RecentDocument[]> {
    if (this.mock) {
      return of(
        documents.map(
          (d): RecentDocument => ({
            ...d,
            originalFileName: d.fileName,
          })
        )
      );
    }
    return this.http
      .get<any>(`${this.base}/dashboard/recent-documents`)
      .pipe(
        map((res: any): RecentDocument[] => {
          const list: any[] = Array.isArray(res) ? res : res?.data || [];
          return list.map(
            (d: any): RecentDocument => ({
              ...d,
              fileName: d.originalFileName || d.fileName,
              originalFileName: d.originalFileName || d.fileName,
            })
          );
        })
      );
  }
  private map() {
    return employees.reduce((a: any, e) => {
      const n =
        typeof e.department === "string"
          ? e.department
          : e.department?.name || "Unassigned";
      a[n] = (a[n] || 0) + 1;
      return a;
    }, {});
  }
}