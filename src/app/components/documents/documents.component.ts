import {
    Component,
    inject,
    signal
} from '@angular/core';
import {
    DecimalPipe,
    DatePipe
} from '@angular/common';
import {
    FormsModule
} from '@angular/forms';
import {
    HttpEventType
} from '@angular/common/http';
import {
    DocumentService
} from '../../services/document.service';
import {
    DocumentRecord
} from '../../models/employee.model';
@Component({
    standalone: true,
    imports: [FormsModule, DecimalPipe, DatePipe],
    templateUrl: './documents.component.html'
})
export class DocumentsComponent {
    private s = inject(DocumentService);
    docs = signal<DocumentRecord[]>([]);
    documentToDelete = signal<DocumentRecord | null>(null);
    files: File[] = [];
    employeeId = 1;
    documentType = 'RESUME';
    filterEmployee: number | undefined;
    filterType = '';
    progress = signal(-1);
    message = signal('');
    failed = signal(false);

    constructor() {
        this.load();
    }

    choose(e: Event) {
        this.files = Array.from((e.target as HTMLInputElement).files || []);
    }

    load() {
        this.s.list().subscribe({
            next: x => this.docs.set(x),
            error: e => {
                this.message.set(this.s.errorMessage(e));
                this.failed.set(true);
            }
        });
    }

    filtered() {
        const typeFilter = (this.filterType || '').trim().toLowerCase();
        return this.docs().filter(d => {
            const matchEmp = !this.filterEmployee || Number(d.employeeId) === Number(this.filterEmployee);
            const matchType = !typeFilter || (d.documentType || '').toLowerCase().includes(typeFilter);
            return matchEmp && matchType;
        });
    }

    resetFilters() {
        this.filterEmployee = undefined;
        this.filterType = '';
    }

    upload() {
        this.progress.set(0);
        this.s.upload(this.employeeId, this.documentType, this.files).subscribe({
            next: e => {
                if (e.type === HttpEventType.UploadProgress) {
                    this.progress.set(Math.round(100 * (e.loaded / (e.total || 1))));
                }
                if (e.type === HttpEventType.Response) {
                    this.message.set('Upload completed successfully.');
                    this.failed.set(false);
                    this.files = [];
                    this.progress.set(-1);
                    this.load();
                }
            },
            error: e => {
                this.message.set(this.s.errorMessage(e));
                this.failed.set(true);
                this.progress.set(-1);
            }
        });
    }

    remove(d: DocumentRecord) {
        this.documentToDelete.set(d);
    }

    confirmRemove() {
        const d = this.documentToDelete();
        if (!d?.id) {
            this.documentToDelete.set(null);
            return;
        }
        this.s.delete(d.id).subscribe({
            next: () => {
                this.message.set('Document deleted successfully.');
                this.failed.set(false);
                this.documentToDelete.set(null);
                this.load();
            },
            error: e => {
                this.message.set(this.s.errorMessage(e));
                this.failed.set(true);
                this.documentToDelete.set(null);
            }
        });
    }

    cancelRemove() {
        this.documentToDelete.set(null);
    }

    download(d: DocumentRecord) {
        this.s.download(d.id).subscribe({
            next: b => {
                const u = URL.createObjectURL(b);
                const a = document.createElement('a');
                a.href = u;
                a.download = d.originalFileName || d.fileName || `document_${d.id}`;
                a.click();
                URL.revokeObjectURL(u);
            },
            error: e => {
                this.message.set(this.s.errorMessage(e));
                this.failed.set(true);
            }
        });
    }
}