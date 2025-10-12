# Class Management for Driving Safety - Setup Guide

Complete step-by-step instructions to get the application running.

## Prerequisites

- **Node.js**: Version 16 or higher
- **npm**: Version 7 or higher
- **Git**: For version control
- **Code Editor**: VS Code recommended

## Quick Start

### Step 1: Backend API Setup

1. Open a terminal and navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client and create the database:
```bash
npm run db:generate
npm run db:push
```

4. Seed the database with test data:
```bash
npm run db:seed
```

You should see output confirming the creation of states, schools, users, classes, students, etc.

5. Start the API server:
```bash
npm run dev
```

The API will start on `http://localhost:5001`

**Keep this terminal open!**

### Step 2: Frontend Setup

1. Open a **NEW** terminal (keep the API running) and navigate to the frontend directory:
```bash
cd ODDS/ui/dev
```

2. Install dependencies:
```bash
npm install
```

3. Start the Quasar development server:
```bash
npm run dev
```

The UI will start on `http://localhost:9000` and should automatically open in your browser.

## Test Credentials

After seeding, use these credentials to log in:

### Admin (Global Access)
- **Email**: `admin@odds.com`
- **Password**: `password`
- Can see all schools' data

### Instructor (School 1)
- **Email**: `instructor@school1.com`
- **Password**: `password`
- Can only see Fort Worth Driving School data

### Instructor (School 2)
- **Email**: `instructor@school2.com`
- **Password**: `password`
- Can only see Dallas Safety Training data

## Testing the Application

### 1. Login (UC-Login)
- Visit `http://localhost:9000`
- Login with one of the test credentials above
- Verify you're redirected to the dashboard

### 2. Dashboard
- See navigation cards for Students, Classes, Locations, Instructors, Reports
- Test global search (searches students)

### 3. Create a Class (UC-1)
- Click "Classes" from dashboard
- Click "Create Class"
- Fill in:
  - Course ID: `1` (Texas Defensive Driving Course)
  - Instructor ID: `1` (Michael Johnson)
  - Location ID: `1` (Joe's Pizza - Hulen Street)
  - Completion Date: Choose a date
  - Amount Paid: `0` (or any amount)
  - Notes: (optional)
- Click "Create Class"
- Verify you're redirected to class list and new class appears

### 4. Student Search (UC-2)
- Click "Students" from dashboard
- Use the advanced search filters:
  - Try searching by first name: "James"
  - Try searching by last name: "Martinez"
  - Try searching by license number: "TX12345678"
  - Try searching by payment status: "Paid" or "Unpaid"
- Click "Search"
- Verify results match your search criteria
- Test sorting by clicking column headers

### 5. Manage Class & Issue Certificates (UC-16)
- Go to "Classes" → Click "Manage" (gear icon) on any class
- You'll see class statistics (total students, processed, paid)
- Click "Process All Certificates" to issue certificates for all students
- Verify each student now has a certificate number
- Try "Email All Certificates" button

### 6. Public Enrollment via QR Code (UC-7)
- Go to "Classes" → Click "QR Code" icon on any class
- You'll see a QR code and enrollment URL
- Copy the enrollment URL (or scan the QR code with your phone)
- Open the URL in a new browser tab/window
- Fill in student information
- Click "Enroll"
- Verify enrollment success message
- Go back to class management and confirm new student appears

### 7. Record Payment (UC-3)
- Go to "Classes" → "Manage" on a class
- Click "Record Payment"
- Enter payment amount (should match $10 × number of paid students)
- Add transaction ID and notes
- Click "Record Payment"
- Verify amount is updated in class card

### 8. Generate Reports
- Go to "Reports"
- **Income Report**:
  - Select date range
  - Click "View Report" or "Download CSV"
  - Verify income data is displayed/downloaded
- **Students Report**:
  - Select date range
  - Click "View Report" or "Download CSV"
- **Students by Class**:
  - Optionally enter a class ID
  - Click "View Report" or "Download CSV"
- **Certificate Export**:
  - Optionally select date range
  - Click "Export CSV for State"
  - Verify CSV is downloaded with proper format

### 9. Instructors & Locations
- Test adding, editing, and viewing instructors
- Test adding, editing, and viewing locations

### 10. Admin Area (Admin user only)
- Login as `admin@odds.com`
- Click your profile → "Admin Area"
- Verify you're in the admin area (red header)
- Admin-specific pages are placeholders for now

### 11. Row-Level Security Test
- Login as `instructor@school1.com`
- Go to "Students" → verify you only see Fort Worth school students
- Go to "Classes" → verify you only see Fort Worth school classes
- Logout and login as `instructor@school2.com`
- Verify you only see Dallas school data
- Login as `admin@odds.com`
- Verify you can see all schools' data

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Make sure you ran `npm install` in both `api/` and `ODDS/ui/dev/` directories

### Issue: API returns 401 errors
**Solution**: Your JWT token may have expired. Logout and login again.

### Issue: Prisma errors
**Solution**: 
```bash
cd api
rm prisma/dev.db
npm run db:generate
npm run db:push
npm run db:seed
```

### Issue: Port already in use
**Solution**: 
- For API (port 5001): Change `PORT` in `api/.env`
- For UI (port 9000): Change `port` in `ODDS/ui/dev/quasar.config.js`

### Issue: CORS errors
**Solution**: Make sure both servers are running (API on 5001, UI on 9000)

## Database Management

### View/Edit Database
```bash
cd api
npm run db:studio
```
Opens Prisma Studio on `http://localhost:5555`

### Reset Database
```bash
cd api
rm prisma/dev.db
npm run db:generate
npm run db:push
npm run db:seed
```

### Add New Data Manually
Use Prisma Studio or create records through the UI

## Development Workflow

### Making Changes

**Backend Changes**:
1. Edit files in `api/src/`
2. Server auto-restarts (watch mode)
3. Test in browser

**Frontend Changes**:
1. Edit files in `ODDS/ui/dev/src/`
2. Hot reload happens automatically
3. Changes appear instantly

### Adding New API Endpoints

1. Add route handler in `api/src/routes/`
2. Update `api/openapi.yaml` (for BoxLang compatibility)
3. Add service method in `ODDS/ui/dev/src/services/api.js`
4. Use in Vue components

### Adding New Pages

1. Create component in `ODDS/ui/dev/src/pages/`
2. Add route in `ODDS/ui/dev/src/router/routes.js`
3. Update navigation if needed

## Production Deployment Notes

### Backend
- Set proper `JWT_SECRET` in environment
- Use PostgreSQL or MySQL instead of SQLite
- Set `NODE_ENV=production`
- Use process manager (PM2, systemd)

### Frontend
- Build: `cd ODDS/ui/dev && npm run build`
- Deploy dist/ folder to static hosting
- Set API_URL environment variable

### BoxLang Migration
- Implement endpoints from `api/openapi.yaml`
- Use same JWT structure and claims
- Maintain row-level security logic
- Keep response formats identical
- Frontend requires NO changes

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│   Browser       │         │   API Server     │
│   (Quasar/Vue)  │ ◄─────► │   (Express)      │
│   Port 9000     │  HTTP   │   Port 5001      │
└─────────────────┘         └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   SQLite DB      │
                            │   (Prisma ORM)   │
                            └──────────────────┘
```

## Key Files

### Backend
- `api/src/index.js` - Main server
- `api/src/routes/*.js` - API endpoints
- `api/prisma/schema.prisma` - Database schema
- `api/src/seed.js` - Test data generator
- `api/openapi.yaml` - API specification

### Frontend
- `ODDS/ui/dev/src/router/routes.js` - All routes
- `ODDS/ui/dev/src/stores/auth.js` - Auth state
- `ODDS/ui/dev/src/services/api.js` - API client
- `ODDS/ui/dev/src/layouts/*.vue` - Layouts
- `ODDS/ui/dev/src/pages/**/*.vue` - All pages

## Next Steps

1. ✅ Test all use cases listed above
2. Customize styling/branding if needed
3. Add more seed data for testing
4. Implement full admin pages (Schools, Users management)
5. Add email integration for certificate delivery
6. Add PDF generation for certificates
7. Deploy to production

## Support

- Review `README.md` for project overview
- Check `api/README.md` for API details
- Review `api/openapi.yaml` for endpoint specs
- Check use case documents for requirements

---

**Congratulations!** Your Class Management system is now running. 🎉

Test all the use cases and report any issues.

