# Class Management for Driving Safety - API

Development API built with Node.js, Express, and SQLite (via Prisma). Designed to be replaced with BoxLang without frontend changes.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client and push schema to database:
```bash
npm run db:generate
npm run db:push
```

3. Seed the database with test data:
```bash
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5001`

## Test Credentials

After seeding, you can log in with:

- **Admin (Global Access):**
  - Email: `admin@odds.com`
  - Password: `password`
  - Has access to all schools

- **Instructor (School 1):**
  - Email: `instructor@school1.com`
  - Password: `password`
  - Has access to Fort Worth Driving School only

- **Instructor (School 2):**
  - Email: `instructor@school2.com`
  - Password: `password`
  - Has access to Dallas Safety Training only

## Key Features

### Authentication (JWT)
- `POST /auth/login` - Returns JWT token with user info including `hasGlobalPermissions`
- Token must be sent in `Authorization: Bearer <token>` header

### Row-Level Security
- Users with `hasGlobalPermissions=1` can see all schools
- Users with `hasGlobalPermissions=0` only see their assigned school's data

### Core Endpoints

**Students** (UC-2 Search)
- `GET /students` - List with search filters (firstName, lastName, phone, email, licenseNumber, etc.)
- `POST /students` - Create student
- `PUT /students/:id` - Update student
- `POST /students/:id/process-certificate` - Issue certificate (UC-16)
- `POST /students/:id/email-certificate` - Email certificate

**Classes** (UC-1, UC-19)
- `GET /classes` - List classes
- `POST /classes` - Create class
- `PUT /classes/:id` - Update class
- `POST /classes/:id/enroll` - Enroll student (UC-7)
- `GET /classes/:id/qr-code` - Generate QR for self-enrollment
- `POST /classes/:id/process-all` - Issue all certificates
- `POST /classes/:id/record-payment` - Record payment (UC-3)

**Instructors**
- `GET /instructors` - List
- `POST /instructors` - Create
- `PUT /instructors/:id` - Update

**Locations**
- `GET /locations` - List
- `POST /locations` - Create
- `PUT /locations/:id` - Update

**Reports**
- `GET /reports/income?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=csv` - Income by date
- `GET /reports/students?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=csv` - Students by date
- `GET /reports/students-by-class?classID=1&format=csv` - Students by class
- `GET /reports/certificates` - CSV export for state

**Public (No Auth)**
- `GET /public/classes/:id` - Public class info
- `POST /public/classes/:id/students` - Self-enrollment via QR code

## OpenAPI Specification

See `openapi.yaml` for complete API documentation. The spec is designed to be stable so BoxLang can implement the same contract.

## Database

SQLite database file: `prisma/dev.db`

To view/edit data:
```bash
npm run db:studio
```

## Environment Variables

Create `.env.local` to override defaults:

```
PORT=5001
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:9000"
```

## Use Cases Implemented

- **UC-1:** Instructor Creates Class
- **UC-2:** Instructor Finds Student (advanced search)
- **UC-3:** Instructor Pays Admin ($10/student tracking)
- **UC-7:** Student Enrolls in Class (including public QR flow)
- **UC-16:** Instructor Creates and Distributes Certificate (stub)
- **UC-19:** Instructor Manages Class

## Payment Processing (UC-3)

The `POST /classes/:id/record-payment` endpoint records instructor payments to admin:
- Expected: $10 per paid student
- Records transaction ID and amount
- Tracks payment status

## Certificate Generation (UC-16)

Certificate processing is stubbed:
- Sequential certificate numbers (0000000001, 0000000002, etc.)
- `POST /students/:id/process-certificate` issues single certificate
- `POST /classes/:id/process-all` batch processes all unprocessed students
- PDF generation placeholder (returns URL stub)

## Deployment Notes

For BoxLang replacement:
1. Implement endpoints from `openapi.yaml`
2. Use same JWT structure (id, email, role, fk_schoolID, hasGlobalPermissions)
3. Maintain row-level security logic
4. Keep same date/number formats in responses
5. Support CSV export for reports

