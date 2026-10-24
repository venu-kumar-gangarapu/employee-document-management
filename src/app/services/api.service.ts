import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { throwError } from "rxjs";
@Injectable({ providedIn: "root" })
export class ApiService {
  protected http = inject(HttpClient);
  protected base = environment.apiBaseUrl;
  protected mock = environment.useMockData;
  errorMessage(error: unknown) {
    const e = error as HttpErrorResponse;
    if (e.status === 0)
      return "Network error: check that the backend is running.";
    if (e.status === 401) return "Unauthorized: sign in again.";
    if (e.status === 403) return "Forbidden: you do not have permission.";
    return (
      (e.error && typeof e.error === "object" && e.error.message) ||
      e.message ||
      "Unexpected server error."
    );
  }
}
