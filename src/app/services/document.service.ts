import { Injectable } from "@angular/core";
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { Observable, of, concat, map } from "rxjs";
import { ApiService } from "./api.service";
import { DocumentRecord } from "../models/employee.model";
import { documents } from "../core/mock-data";
@Injectable({ providedIn: "root" })
export class DocumentService extends ApiService {
  list(): Observable<DocumentRecord[]> {
    if (this.mock) {
      return of([...documents]);
    }
    return this.http.get<any>(`${this.base}/documents`).pipe(
      map((res: any): DocumentRecord[] => {
        const list: any[] = Array.isArray(res) ? res : res?.data || [];
        return list.map((d: any) => {
          let inferredEmployeeId = d.employeeId;
          if (inferredEmployeeId === undefined || inferredEmployeeId === null) {
            const match = d.filePath ? d.filePath.match(/[/\\]employees[/\\](\d+)[/\\]/) : null;
            if (match) {
              inferredEmployeeId = Number(match[1]);
            }
          }
          return {
            ...d,
            fileName: d.originalFileName || d.fileName || d.storedFileName || "Unnamed File",
            originalFileName: d.originalFileName || d.fileName || d.storedFileName,
            employeeId: inferredEmployeeId,
          };
        });
      }),
    );
  }
  upload(
    employeeId: number,
    type: string,
    files: File[],
  ): Observable<HttpEvent<any>> {
    const data = new FormData();
    data.append("employeeId", String(employeeId));
    data.append("documentType", type);
    files.forEach((f) => data.append("file", f));
    if (this.mock) {
      const added = files.map((f, i) => ({
        id: Date.now() + i,
        fileName: f.name,
        fileType: f.type,
        fileSize: f.size,
        uploadedAt: new Date().toISOString(),
        status: "UPLOADED",
        employeeId,
        documentType: type,
      }));
      documents.push(...added);
      return concat(
        of({
          type: HttpEventType.UploadProgress,
          loaded: 50,
          total: 100,
        } as any),
        of({ type: HttpEventType.Response, body: added } as any),
      );
    }
    return this.http.post(
      `${this.base}/${files.length > 1 ? "documents/upload-multiple" : "documents/upload"}`,
      data,
      { observe: "events", reportProgress: true },
    );
  }
  delete(id: number) {
    if (this.mock) {
      const i = documents.findIndex((d) => d.id === id);
      documents.splice(i, 1);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.base}/documents/${id}`);
  }
  download(id: number) {
    return this.http.get(`${this.base}/documents/${id}/download`, {
      responseType: "blob",
    });
  }
}
