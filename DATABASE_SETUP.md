# Remote SQL Database Setup Guide

## Connection Information
- **IP Address**: 167.71.105.240
- **Current Setup**: SQLite (local)
- **Target Setup**: MySQL/PostgreSQL (remote)

---

## Setup Instructions

### For MySQL / MariaDB

#### 1. Install MySQL Client Library
```bash
cd ODDS/api
npm install mysql2
```

#### 2. Update Environment Variables
Edit `ODDS/api/.env` and update the `DATABASE_URL`:

**Format:**
```env
DATABASE_URL="mysql://USERNAME:PASSWORD@167.71.105.240:3306/DATABASE_NAME"
```

**Example:**
```env
DATABASE_URL="mysql://odds_user:your_password@167.71.105.240:3306/odds_db"
```

**With SSL (recommended for production):**
```env
DATABASE_URL="mysql://odds_user:your_password@167.71.105.240:3306/odds_db?sslmode=require"
```

#### 3. Update Prisma Schema
✅ **Already updated** to use MySQL provider

#### 4. Generate Prisma Client
```bash
cd ODDS/api
npx prisma generate
```

#### 5. Create Database Tables (Push Schema)
```bash
cd ODDS/api
npx prisma db push
```

This will create all tables, indexes, and relationships in your remote database.

#### 6. Seed the Database (Optional)
```bash
cd ODDS/api
npm run db:seed
```

---

### For PostgreSQL

If you're using PostgreSQL instead:

#### 1. Install PostgreSQL Client Library
```bash
cd ODDS/api
npm install pg
```

#### 2. Update Prisma Schema
Edit `ODDS/api/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 3. Update Environment Variables
Edit `ODDS/api/.env`:

**Format:**
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@167.71.105.240:5432/DATABASE_NAME"
```

**Example:**
```env
DATABASE_URL="postgresql://odds_user:your_password@167.71.105.240:5432/odds_db"
```

**With SSL:**
```env
DATABASE_URL="postgresql://odds_user:your_password@167.71.105.240:5432/odds_db?sslmode=require"
```

#### 4. Generate Client, Push Schema, and Seed
```bash
cd ODDS/api
npx prisma generate
npx prisma db push
npm run db:seed
```

---

## Important Notes

### 1. Database Credentials
You'll need:
- **Username**: Your database user
- **Password**: User password
- **Database Name**: The database to use
- **Port**: 3306 (MySQL) or 5432 (PostgreSQL)

### 2. Firewall & Security
Make sure:
- The database server allows connections from your IP
- Port 3306 (MySQL) or 5432 (PostgreSQL) is open
- User has proper permissions (CREATE, ALTER, SELECT, INSERT, UPDATE, DELETE)

### 3. Test Connection
You can test the connection before running migrations:
```bash
cd ODDS/api
npx prisma db pull
```

This will attempt to read the database schema (won't modify anything).

### 4. Migration Strategy

**Option A: Push Schema (Recommended for initial setup)**
```bash
npx prisma db push
```
- Applies schema directly without migration files
- Good for development and initial setup

**Option B: Create Migrations (Recommended for production)**
```bash
npx prisma migrate dev --name init
```
- Creates migration files in `prisma/migrations/`
- Better for version control and production deployments

---

## Troubleshooting

### Connection Timeout
```
Error: P1001: Can't reach database server at 167.71.105.240:3306
```
**Solution:** Check firewall rules and ensure the database server is accessible from your network.

### Authentication Failed
```
Error: P1000: Authentication failed
```
**Solution:** Verify your username and password are correct.

### Database Doesn't Exist
```
Error: P1003: Database does not exist
```
**Solution:** Create the database first:
```sql
CREATE DATABASE odds_db;
```

### SSL Required
```
Error: SSL connection required
```
**Solution:** Add `?sslmode=require` to your connection string.

---

## Quick Start Checklist

- [ ] Get database credentials (username, password, database name)
- [ ] Install database client library (`mysql2` or `pg`)
- [ ] Update `.env` file with `DATABASE_URL`
- [ ] Verify schema.prisma has correct provider
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Run `npm run db:seed` (optional)
- [ ] Test the API server: `npm start`
- [ ] Update frontend if needed (usually no changes required)

---

## Current Status

✅ Schema updated to MySQL
⏳ Waiting for database credentials
⏳ Need to install MySQL2 client
⏳ Need to update .env file
⏳ Need to push schema to remote database
⏳ Need to seed database

---

## Contact Database Administrator

Before proceeding, you'll need from your DBA:
1. Database username
2. Database password  
3. Database name (or create one)
4. Confirm MySQL or PostgreSQL
5. Confirm port is open (3306 or 5432)
6. SSL requirements (if any)

