export type EmployeeStatus = 'ACTIVE'|'INACTIVE';
export interface Department { id?: number; name: string; }
export interface Manager { id?: number; name: string; }
export interface DocumentRecord { id:number; fileName:string; fileType:string; fileSize:number; uploadedAt:string; status:string; employeeId?:number; documentType?:string; }
export interface Activity { id?:number; description:string; occurredAt:string; }
export interface Employee { id?:number; employeeCode:string; firstName:string; lastName:string; email:string; phone?:string|null; department?:Department|string|null; departmentName?:string|null; designation?:string|null; salary?:number|null; joiningDate?:string|null; status:EmployeeStatus; manager?:Manager|string|null; skills?:string[]|null; documents?:DocumentRecord[]|null; recentActivities?:Activity[]|null; }
export interface PageResponse<T> {
  content: T[];
  page: number;
  number?: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

