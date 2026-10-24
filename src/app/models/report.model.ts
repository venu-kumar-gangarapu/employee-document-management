export interface ApiResponse<T> {
  status: number;
  data: T;
  message?: string;
}

export interface DashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalDocuments: number;
  documentsThisMonth: number;
}

export type CountMap = Record<string, number>;

export interface RecentDocument {
  id?: number;
  documentType?: string;
  originalFileName?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
  status?: string;
  employeeId?: number;
}


export interface SalaryReport {
  totalEmployees: number;
  averageSalary: number;
  highestSalary: number;
  departments: CountMap;
}


