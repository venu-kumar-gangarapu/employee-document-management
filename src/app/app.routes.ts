import { Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { EmployeesComponent } from "./components/employees/employees.component";
import { EmployeeDetailsComponent } from "./components/employee-details/employee-details.component";
import { DocumentsComponent } from "./components/documents/documents.component";
import { ReportsComponent } from "./components/reports/reports.component";
export const routes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "employees", component: EmployeesComponent },
  { path: "employees/:id", component: EmployeeDetailsComponent },
  { path: "documents", component: DocumentsComponent },
  { path: "reports", component: ReportsComponent },
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  { path: "**", redirectTo: "dashboard" },
];
