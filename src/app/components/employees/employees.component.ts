import {
    Component,
    inject,
    signal
} from '@angular/core';
import {
    RouterLink
} from '@angular/router';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {
    Employee,
    PageResponse
} from '../../models/employee.model';
import {
    EmployeeService
} from '../../services/employee.service';
@Component({
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule],
    templateUrl: './employees.component.html'
}) export class EmployeesComponent {
    private s = inject(EmployeeService);
    private fb = inject(FormBuilder);
    loading = signal(false);
    message = signal('');
    error = signal(false);
    showForm = signal(false);
    editing = signal<Employee | null>(null);
    pageSize = signal<number>(10);
    page = signal<PageResponse<Employee>>({
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });
    filters = this.fb.group({
        keyword: '',
        departmentName: '',
        status: '',
        sort: 'firstName,asc'
    });
    form = this.fb.group({
        employeeCode: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        departmentName: '',
        designation: '',
        status: 'ACTIVE',
        salary: 0
    });
    constructor() {
        this.load(0);
    }
    load(n: number) {
        this.loading.set(true);
        const f = this.filters.getRawValue();
        this.s.list({
            page: n,
            size: this.pageSize(),
            keyword: f.keyword || undefined,
            departmentName: f.departmentName || undefined,
            status: f.status || undefined,
            sort: f.sort || undefined
        }).subscribe({
            next: x => {
                this.page.set(x);
                this.loading.set(false);
            },
            error: e => {
                this.message.set(this.s.errorMessage(e));
                this.error.set(true);
                this.loading.set(false);
            }
        });
    }
    onPageSizeChange(e: Event) {
        const newSize = Number((e.target as HTMLSelectElement).value);
        this.pageSize.set(newSize);
        this.load(0);
    }
    open(e?: Employee) {
        this.editing.set(e || null);
        this.form.reset({
            employeeCode: e?.employeeCode || '',
            firstName: e?.firstName || '',
            lastName: e?.lastName || '',
            email: e?.email || '',
            departmentName: e?.departmentName || (typeof e?.department === 'string' ? e.department : e?.department?.name || ''),
            designation: e?.designation || '',
            status: e?.status || 'ACTIVE',
            salary: e?.salary || 0
        });
        this.showForm.set(true);
    }
    save() {
        const v = this.form.getRawValue();
        const old = this.editing();
        const model: any = {
            ...old,
            ...v,
            departmentName: v.departmentName,
            department: v.departmentName ? {
                id: v.departmentName
            } : null
        };
        const done = () => {
            this.showForm.set(false);
            this.message.set('Employee saved successfully.');
            this.error.set(false);
            this.load(this.page().page);
        };
        (old ? this.s.update(old.id!, model) : this.s.create(model)).subscribe({
            next: done,
            error: e => {
                this.message.set(this.s.errorMessage(e));
                this.error.set(true);
            }
        });
    }
    remove(e: Employee) {
        if (confirm(`Delete ${e.firstName} ${e.lastName}?`)) this.s.delete(e.id!).subscribe({
            next: () => {
                this.message.set('Employee deleted.');
                this.load(this.page().page);
            },
            error: x => {
                this.message.set(this.s.errorMessage(x));
                this.error.set(true);
            }
        });
    }
}