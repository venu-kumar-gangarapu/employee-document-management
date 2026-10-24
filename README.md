# Employee Document Management System — Angular

A standalone Angular 18 frontend with exactly five UI pages: Dashboard, Employee Management, Employee Details, Document/File Management, and Reports.

## Run
1. `npm install`
2. `ng serve`
3. Open `http://localhost:4200`

It starts in realistic mock-data mode so every page is demonstrable without a server. To connect Spring Boot, set `useMockData: false` and change `apiBaseUrl` in `src/environments/environment.ts`. API URLs are centralized in services; no component hardcodes the base URL.

## API contract
The application calls the requested `/api/dashboard`, `/api/employees`, `/api/documents`, and `/api/reports` endpoints. It uses `PageResponse<T>` for employee paging, `Record<string, number>` for Java Map/HashMap JSON responses, `FormData` plus progress events for uploads, and Blob/object URLs for document and report downloads.

## Design notes
- Reactive Forms drive filters and employee create/edit dialog.
- Angular Signals hold UI state where useful.
- `HttpClient` and an error interceptor are configured in `app.config.ts`.
- The error helper maps network, 401, 403, and JSON error-message responses to displayable feedback.
- Documents endpoint filtering UI is local in mock mode; add query parameters to `DocumentService.list()` when the backend contract includes them.

## Main pages
Routes: `/dashboard`, `/employees`, `/employees/:id`, `/documents`, `/reports`.
