import {
    Component,
    inject,
    signal
} from '@angular/core';
import {
    ActivatedRoute,
    RouterLink
} from '@angular/router';
import {
    DatePipe,
    CurrencyPipe
} from '@angular/common';
import {
    EmployeeService
} from '../../services/employee.service';
import {
    Employee
} from '../../models/employee.model';
@Component({
    standalone: true,
    imports: [RouterLink, DatePipe, CurrencyPipe],
    templateUrl: './employee-details.html'
}) export class EmployeeDetailsComponent {
    private route = inject(ActivatedRoute);
    private s = inject(EmployeeService);
    employee = signal < any | null > (null);
    error = signal('');
    constructor() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.s.get(id).subscribe({
            next: (x:any) => this.employee.set(x.data),
            error: e => this.error.set(this.s.errorMessage(e))
        })
    }
}