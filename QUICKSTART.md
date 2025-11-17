# Quick Start Guide

Get the Class Management system running in 5 minutes!

## Step 1: Start the API (Terminal 1)

```bash
cd api
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

✅ API running on `http://localhost:5001`

## Step 2: Start the Frontend (Terminal 2)

```bash
cd ODDS/ui/dev
npm install
npm run dev
```

✅ UI running on `http://localhost:9000`

## Step 3: Login

Open `http://localhost:9000` in your browser

**Login with**:
- Email: `admin@odds.com`
- Password: `password`

## Test the System

1. **Dashboard** - See navigation cards
2. **Students** - Search with filters (UC-2)
3. **Classes** - Create a class (UC-1)
4. **QR Code** - Generate enrollment QR
5. **Reports** - Download CSV reports

## All Use Cases Work!

- ✅ UC-1: Create Class
- ✅ UC-2: Find Student (advanced search)
- ✅ UC-3: Record Payment ($10/student)
- ✅ UC-7: Student Enrollment (public QR flow)
- ✅ UC-16: Issue Certificates
- ✅ UC-19: Manage Class

## Need Help?

See `SETUP.md` for detailed instructions.

---

**You're all set!** 🚀

