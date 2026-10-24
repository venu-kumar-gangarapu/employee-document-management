import { Injectable } from "@angular/core";
import { Observable, of, throwError, map } from "rxjs";
import { Employee, PageResponse } from "../models/employee.model";
import { ApiService } from "./api.service";
import { employees } from "../core/mock-data";
@Injectable({ providedIn: "root" })
export class EmployeeService extends ApiService {
  private next = 5;
  list(q: {
    page: number;
    size: number;
    keyword?: string;
    department?: string;
    departmentName?: string;
    status?: string;
    sort?: string;
  }): Observable<PageResponse<Employee>> {
    if (!this.mock) {
      let p: any = { page: q.page, size: q.size };
      const dept = q.departmentName || q.department;
      if (dept) {
        p.departmentName = dept;
      }
      ["status", "sort"].forEach((k) => {
        const v = q[k as keyof typeof q];
        if (v) p[k] = v;
      });
      return this.http
        .get<any>(
          q.keyword ? `${this.base}/employees/search` : `${this.base}/employees`,
          {
            params: q.keyword
              ? { keyword: q.keyword, page: q.page, size: q.size }
              : p,
          },
        )
        .pipe(
          map((res: any): PageResponse<Employee> => {
            const data = res?.data !== undefined ? res.data : res;
            if (Array.isArray(data)) {
              return {
                content: data,
                page: q.page,
                size: q.size,
                totalElements: data.length,
                totalPages: Math.ceil(data.length / q.size) || 1,
              };
            }
            return {
              content: data?.content || [],
              page: data?.number ?? data?.page ?? data?.pageable?.pageNumber ?? q.page,
              number: data?.number ?? data?.page ?? q.page,
              size: data?.size ?? data?.pageable?.pageSize ?? q.size,
              totalElements: data?.totalElements ?? (data?.content?.length || 0),
              totalPages: data?.totalPages ?? 1,
              first: data?.first,
              last: data?.last,
              numberOfElements: data?.numberOfElements ?? data?.content?.length,
              empty: data?.empty ?? (data?.content?.length === 0),
            };
          }),
        );
    }
    let a = [...employees];
    const term = (q.keyword || "").toLowerCase();
    if (term)
      a = a.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.employeeCode}`
          .toLowerCase()
          .includes(term),
      );
    const dept = q.departmentName || q.department;
    if (dept)
      a = a.filter(
        (e) =>
          (e.departmentName ||
            (typeof e.department === "string"
              ? e.department
              : e.department?.name)) === dept,
      );
    if (q.status) a = a.filter((e) => e.status === q.status);
    if (q.sort) {
      const [f, d] = q.sort.split(",");
      a.sort(
        (x: any, y: any) =>
          String(x[f] ?? "").localeCompare(String(y[f] ?? "")) *
          (d === "desc" ? -1 : 1),
      );
    }
    const start = q.page * q.size;
    return of({
      content: a.slice(start, start + q.size),
      page: q.page,
      size: q.size,
      totalElements: a.length,
      totalPages: Math.ceil(a.length / q.size),
    });
  }
  get(id: number) {
    return this.mock
      ? of(employees.find((e) => e.id === id)!)
      : this.http.get<Employee>(`${this.base}/employees/${id}`);
  }
  create(e: Employee) {
    if (this.mock) {
      e = { ...e, id: this.next++ };
      employees.push(e);
      return of(e);
    }
    return this.http.post<Employee>(`${this.base}/employees`, e);
  }
  update(id: number, e: Employee) {
    if (this.mock) {
      const i = employees.findIndex((x) => x.id === id);
      employees[i] = { ...e, id };
      return of(employees[i]);
    }
    return this.http.put<Employee>(`${this.base}/employees/${id}`, e);
  }
  delete(id: number) {
    if (this.mock) {
      const i = employees.findIndex((x) => x.id === id);
      if (i >= 0) employees.splice(i, 1);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.base}/employees/${id}`);
  }
}
