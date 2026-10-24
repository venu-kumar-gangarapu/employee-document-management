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
    template: `<section class="page"><div class="title"><div><h2>Document / file management</h2>
    <p>Upload PDF, Excel, Word and image files with employee metadata.</p></div></div>
    <div class="grid two"><form class="panel" (ngSubmit)="upload()"><h3>Upload documents</h3><label>Employee ID<input type="number" [(ngModel)]="employeeId" name="employeeId" required></label><label>Document type<select [(ngModel)]="documentType" name="type"><option>RESUME</option><option>ID_PROOF</option><option>CONTRACT</option><option>CERTIFICATE</option></select></label><label class="file">Choose one or more files<input type="file" multiple accept=".pdf,.xlsx,.xls,.doc,.docx,image/*" (change)="choose($event)"></label><p class="hint">Selected: {{files.length}}. Files are sent as <code>multipart/form-data</code> using <code>FormData</code>.</p>@if(progress()>=0){<div class="progress"><i [style.width.%]="progress()"></i></div><p>{{progress()}}%</p>}<button class="primary" [disabled]="!files.length">Upload</button>@if(message()){<div class="alert" [class.error]="failed()">{{message()}}</div>}</form><article class="panel"><h3>Filters</h3><label>Employee ID<input type="number" [(ngModel)]="filterEmployee" name="filterEmployee"></label><label>Document type<input [(ngModel)]="filterType" name="filterType"></label><button (click)="load()">Apply filters</button><p class="hint">The service is ready for backend filtering parameters when your API supports them.</p></article></div><article class="panel tablewrap"><h3>Uploaded files</h3><table><thead><tr><th>File</th><th>Employee</th><th>Type</th><th>Uploaded</th><th>Actions</th></tr></thead><tbody>@for(d of filtered();track d.id){<tr><td><b>{{d.fileName}}</b><br><small>{{d.fileType}} · {{d.fileSize|number}} bytes</small></td><td>{{d.employeeId}}</td><td>{{d.documentType}}</td><td>{{d.uploadedAt|date:'medium'}}</td><td class="actions"><button (click)="download(d)">Download</button><button class="danger" (click)="remove(d)">Delete</button></td></tr>}@empty{<tr><td colspan="5" class="empty">No documents found.</td></tr>}</tbody></table></article></section>`
})
export class DocumentsComponent {
    private s = inject(DocumentService);
    docs = signal < DocumentRecord[] > ([]);
    files: File[] = [];
    employeeId = 1;
    documentType = 'RESUME';
    filterEmployee: number | undefined;
    filterType = '';
    progress = signal(-1);
    message = signal('');
    failed = signal(false);
    constructor() {
        this.load()
    }
    choose(e: Event) {
        this.files = Array.from((e.target as HTMLInputElement).files || [])
    }
    load() {
        this.s.list().subscribe(x => this.docs.set(x))
    }
    filtered() {
        return this.docs().filter(d => (!this.filterEmployee || d.employeeId === this.filterEmployee) && (!this.filterType || d.documentType === this.filterType))
    }
    upload() {
        this.progress.set(0);
        this.s.upload(this.employeeId, this.documentType, this.files).subscribe({
                next: e => {
                    if (e.type === HttpEventType.UploadProgress) this.progress.set(Math.round(100 * (e.loaded / (e.total || 1))));
                        if (e.type === HttpEventType.Response) {
                            this.message.set('Upload completed successfully.');
                            this.failed.set(false);
                            this.files = [];
                            this.load()
                        }
                    }, error: e => {
                        this.message.set(this.s.errorMessage(e));
                        this.failed.set(true)
                    }
                })
        }
        remove(d: DocumentRecord) {
            if (confirm(`Delete ${d.fileName}?`)) this.s.delete(d.id).subscribe(() => this.load())
        }
        download(d: DocumentRecord) {
            this.s.download(d.id).subscribe({
                next: b => {
                    const u = URL.createObjectURL(b);
                    const a = document.createElement('a');
                    a.href = u;
                    a.download = d.fileName;
                    a.click();
                    URL.revokeObjectURL(u)
                },
                error: e => {
                    this.message.set(this.s.errorMessage(e));
                    this.failed.set(true)
                }
            })
        }
    }