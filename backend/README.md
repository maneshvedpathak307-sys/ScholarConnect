# PG Scholarship Management and Application Portal – Backend

Spring Boot 3.5.7 / Java 21 / MySQL 8 / Spring Security / JWT.

## 1. Requirements
- JDK 21
- Maven 3.9+
- MySQL 8+
- Postman

## 2. Database
Create the database:
```sql
CREATE DATABASE scholarship_portal;
```

## 3. Configure credentials
Edit `src/main/resources/application.properties`, or set environment variables:
- `DB_URL` (default jdbc:mysql://localhost:3306/scholarship_portal...)
- `DB_USERNAME` (default root)
- `DB_PASSWORD` (default root)
- `JWT_SECRET` (set a unique random secret of at least 32 bytes)
- `FRONTEND_ORIGIN` (default http://localhost:5173)
- `UPLOAD_DIR` (default uploads)
- `APP_ADMIN_EMAIL`, `APP_ADMIN_PASSWORD`, `APP_ADMIN_NAME` (optional initial admin account)

Spring Boot maps `APP_ADMIN_EMAIL` to `app.admin.email` etc. Use a strong admin password and do not commit it.

## 4. Run
```bash
mvn clean spring-boot:run
```
API base URL: `http://localhost:8080`

## 5. First admin
Set environment variables before starting:
```bash
# Windows PowerShell
$env:APP_ADMIN_EMAIL="admin@example.com"
$env:APP_ADMIN_PASSWORD="Use-A-Strong-Unique-Password"
$env:APP_ADMIN_NAME="Portal Admin"
mvn spring-boot:run
```
The admin is created only if that email does not already exist. Public registration always creates STUDENT accounts; users cannot self-select ADMIN.

## 6. Main endpoints
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/scholarships/active` | Public |
| POST | `/api/applications` | Student |
| PUT | `/api/applications/{id}` | Owner student, draft/correction only |
| GET | `/api/applications/my` | Student |
| GET | `/api/applications/{id}` | Owner student |
| POST | `/api/applications/{id}/submit` | Owner student |
| POST | `/api/documents/upload/{applicationId}` | Owner student |
| GET | `/api/documents/application/{applicationId}` | Owner student |
| GET | `/api/documents/{documentId}/download` | Owner student |
| GET | `/api/admin/applications` | Admin |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/applications/{id}` | Admin |
| GET | `/api/admin/documents/application/{applicationId}` | Admin |
| PUT | `/api/admin/documents/{documentId}/verify?verified=true&remark=...` | Admin |
| GET | `/api/admin/documents/{documentId}/download` | Admin |
| PUT | `/api/admin/applications/{id}/start-review` | Admin |
| PUT | `/api/admin/applications/{id}/approve` | Admin |
| PUT | `/api/admin/applications/{id}/reject` | Admin |
| PUT | `/api/admin/applications/{id}/request-correction` | Admin |
| GET/POST | `/api/admin/scholarships` | Admin (GET active public endpoint separately) |
| PUT | `/api/admin/scholarships/{id}` | Admin |
| GET | `/api/notifications` | Student |

## 7. Authentication
After login/register, copy `token` from the response. For protected endpoints add:
`Authorization: Bearer YOUR_TOKEN`

## 8. Example requests
Register:
```json
{"fullName":"Demo Student","email":"student@example.com","password":"Student@123","mobileNumber":"9876543210"}
```
Login:
```json
{"email":"student@example.com","password":"Student@123"}
```
Create a draft application:
```json
{
  "scholarshipId": 1,
  "scholarshipReason": "I need financial support to continue my postgraduate education.",
  "fatherName": "Demo Father",
  "fatherOccupation": "Service",
  "motherName": "Demo Mother",
  "motherOccupation": "Homemaker",
  "annualFamilyIncome": 180000,
  "accountHolderName": "Demo Student",
  "bankName": "Example Bank",
  "branchName": "Main Branch",
  "accountNumber": "000000000000",
  "ifscCode": "EXAM0001234",
  "currentCourse": "MCA",
  "collegeName": "Example College",
  "currentYear": 2,
  "academicCategory": "OBC",
  "education": [
    {"educationLevel":"10TH","institutionName":"School","boardOrUniversity":"State Board","passingYear":2019,"percentage":80.0},
    {"educationLevel":"12TH","institutionName":"Junior College","boardOrUniversity":"State Board","passingYear":2021,"percentage":75.0},
    {"educationLevel":"GRADUATION","institutionName":"Degree College","boardOrUniversity":"University","passingYear":2024,"cgpa":7.5},
    {"educationLevel":"POST_GRADUATION","institutionName":"PG College","boardOrUniversity":"University","passingYear":2026,"cgpa":8.0}
  ]
}
```
Create scholarship as admin:
```json
{
  "name":"Postgraduate Merit Scholarship",
  "description":"Scholarship for eligible postgraduate students.",
  "eligibleCategory":"OBC",
  "eligibleCourse":"MCA",
  "maximumFamilyIncome":250000,
  "awardAmount":20000,
  "startDate":"2026-11-01",
  "endDate":"2027-01-31",
  "active":true
}
```
Upload document as multipart form-data:
- `documentType`: `INCOME_CERTIFICATE` (or one of the DocumentType enum values)
- `file`: select PDF/JPG/PNG, max 5 MB

Admin review body:
```json
{"remarks":"Documents verified. Application approved."}
```

## 9. Notes / current implementation boundaries
- This is the first runnable backend foundation with authentication, scholarship CRUD, application drafts/submission, education records, document upload/download, admin decisions, basic stats and notifications.
- Application form data is saved in one application aggregate with a separate education table. React can show it as six steps while saving draft progress.
- Add profile/family separation, document verification endpoints, PDF generation, richer reporting, pagination, email/SMS, and stricter production-grade file scanning before a real public deployment.
- Uploaded files are stored locally under `uploads/`; use private object storage for production. Student document downloads enforce ownership; separate admin-only document listing, verification and download endpoints are included.
- For production, add database migrations (Flyway), HTTPS, secret management, rate limiting, account verification, audit logging, encrypted bank identifiers, retention rules and automated tests. Never use real Aadhaar/PAN/bank data in local demos.
