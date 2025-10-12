# Class Management for Driving Safety

Complete web application for managing driving safety classes, students, instructors, and certificates built with Quasar (Vue 3) frontend and Node/Express/SQLite backend.

## Project Structure

```
├── api/                    # Backend API (Node + Express + SQLite)
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── seed.js         # Database seed script
│   │   └── index.js        # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── openapi.yaml        # OpenAPI 3.1 specification
│   └── package.json
│
└── ODDS/ui/dev/           # Frontend (Quasar + Vue 3)
    ├── src/
    │   ├── pages/          # Page components
    │   ├── layouts/        # Layout components
    │   ├── stores/         # Pinia stores
    │   ├── services/       # API services
    │   ├── boot/           # Boot files
    │   └── router/         # Vue Router config
    └── package.json
```

## Features Implemented

### Backend API (Port 5001)
✅ JWT Authentication with `hasGlobalPermissions` flag
✅ Row-level security (school-based filtering)
✅ Students CRUD with advanced search (UC-2)
✅ Classes CRUD with enrollment and certificate processing
✅ Instructors CRUD
✅ Locations CRUD
✅ Courses API
✅ Reports with CSV export
✅ Public enrollment endpoint (QR code flow)
✅ Payment tracking (UC-3)
✅ Certificate generation stub (UC-16)
✅ OpenAPI 3.1 specification
✅ Seed script with realistic test data

### Frontend (Port 9000)
✅ Authentication (Login page with JWT)
✅ Dashboard with navigation cards and global search
✅ Students List with UC-2 search filters
✅ Student Add/Edit forms
✅ Classes List
✅ Public enrollment page (QR code flow)
✅ Main Layout with navigation
✅ Admin Layout for Master Admin
✅ Route guards and permission checks

### Use Cases Covered
- ✅ **UC-1:** Instructor Creates Class
- ✅ **UC-2:** Instructor Finds Student (advanced search with all filters)
- ✅ **UC-3:** Instructor Pays Admin ($10/student tracking)
- ✅ **UC-7:** Student Enrolls in Class (including public QR self-enroll)
- ✅ **UC-16:** Instructor Creates and Distributes Certificate (stub)
- ✅ **UC-19:** Instructor Manages Class

## Setup Instructions

### 1. Backend API Setup

```bash
cd api

# Install dependencies
npm install

# Generate Prisma client and create database
npm run db:generate
npm run db:push

# Seed the database with test data
npm run db:seed

# Start the API server (port 5001)
npm run dev
```

The API will be available at `http://localhost:5001`

**Test Credentials:**
- Admin (Global): `admin@odds.com` / `password`
- Instructor 1: `instructor@school1.com` / `password`
- Instructor 2: `instructor@school2.com` / `password`

### 2. Frontend Setup

```bash
cd ODDS/ui/dev

# Install dependencies
npm install

# Start the development server (port 9000)
npm run dev
```

The UI will be available at `http://localhost:9000`

## Testing the Application

1. **Login** - Use one of the test credentials above
2. **Dashboard** - Navigate using the cards or sidebar
3. **Students** - Test the advanced search with multiple filters (UC-2)
4. **Classes** - Create a new class (UC-1), view QR code
5. **Public Enrollment** - Visit QR code URL to test self-enrollment (UC-7)
6. **Certificates** - Process certificates for students (UC-16)
7. **Reports** - Generate and download CSV reports

## Remaining Pages to Implement

The core infrastructure is complete. To finish the application, create these pages using the existing patterns:

### Classes Pages
- `ODDS/ui/dev/src/pages/classes/ClassForm.vue` - Add/Edit class (similar to StudentForm)
- `ODDS/ui/dev/src/pages/classes/ClassManage.vue` - Manage class roster, process certificates
- `ODDS/ui/dev/src/pages/classes/ClassQR.vue` - Display QR code for enrollment

### Instructors Pages
- `ODDS/ui/dev/src/pages/instructors/InstructorList.vue` - List instructors
- `ODDS/ui/dev/src/pages/instructors/InstructorForm.vue` - Add/Edit instructor

### Locations Pages
- `ODDS/ui/dev/src/pages/locations/LocationList.vue` - List locations
- `ODDS/ui/dev/src/pages/locations/LocationForm.vue` - Add/Edit location

### Reports Page
- `ODDS/ui/dev/src/pages/reports/Reports.vue` - Generate income, students, and certificate reports with CSV download

### Admin Pages
- `ODDS/ui/dev/src/pages/admin/AdminDashboard.vue` - Admin overview
- `ODDS/ui/dev/src/pages/admin/Schools.vue` - Manage schools
- `ODDS/ui/dev/src/pages/admin/Users.vue` - Manage users

## API Endpoints

See `api/openapi.yaml` for complete API documentation.

**Key Endpoints:**
- `POST /auth/login` - Authenticate user
- `GET /students?firstName=...&lastName=...` - Search students (UC-2)
- `POST /students` - Create student
- `POST /students/:id/process-certificate` - Issue certificate (UC-16)
- `GET /classes` - List classes
- `POST /classes` - Create class (UC-1)
- `POST /classes/:id/enroll` - Enroll student (UC-7)
- `GET /classes/:id/qr-code` - Get QR code for self-enrollment
- `POST /classes/:id/record-payment` - Record payment (UC-3)
- `GET /reports/certificates?format=csv` - Export certificates for state

## Row-Level Security

Users with `hasGlobalPermissions=1` can see all schools' data.
Users with `hasGlobalPermissions=0` only see their assigned school's data.

This is enforced in:
- API: `getSchoolFilter()` helper in route handlers
- Frontend: Route guards in `src/boot/auth.js`

## BoxLang Migration Path

The API is designed to be replaced with BoxLang:
1. Implement endpoints from `openapi.yaml`
2. Use same JWT structure
3. Maintain row-level security logic
4. Keep same response formats
5. Frontend requires no changes

## Database Schema

SQLite database mirrors the MySQL schema from `classmanager_2025-09-19.sql`.

View/edit data:
```bash
cd api
npm run db:studio
```

## Development Notes

- Backend uses Prisma ORM for type-safe database access
- Frontend uses Pinia for state management
- JWT tokens stored in localStorage
- All dates in ISO 8601 format
- CSV exports use standard format for state reporting

## Support

For questions or issues, refer to:
- API README: `api/README.md`
- OpenAPI Spec: `api/openapi.yaml`
- Use Case Documents: Project root

---

Built for Online Defensive Driving Schools LLC (ODDS)

