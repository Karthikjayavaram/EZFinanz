# EZFINANZ Digital Personal-Loan Application Platform

EZFINANZ is a comprehensive, full-stack digital personal loan application platform built for both customers and administrators.

## Features

### Customer Portal
- Secure Registration and Login
- View Loan Application Status Dashboard
- (Backend APIs ready for) OTP Verification, KYC, Eligibility checks, EMI calculations, Bank Details, Declarations, and Selfie uploads.

### Admin Portal
- Secure Admin Login
- Admin Dashboard with metrics (Total, Pending, Approved)
- View recent applications and status
- (Backend APIs ready for) Review selfies, approve/reject applications, and disburse loans.

## Architecture

- **Frontend:** React, Vite, Tailwind CSS v4, React Router, React Hook Form, Zod.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt.
- **Database:** Local MongoDB or In-Memory MongoDB for Demo Mode.

## Environment Setup

Ensure you have Node.js installed (v18+ recommended).

### Backend `.env`
Create a `.env` in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ezfinanz
JWT_SECRET=supersecretjwtkey_replace_me
DEMO_MODE=true
```
*(If `DEMO_MODE=true`, it will automatically use an in-memory database and seed demo data on startup, making it completely independent of a local MongoDB installation!)*

## Installation & Running

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
*(Runs on http://localhost:5000)*

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Runs on http://localhost:5173)*

## Demo Credentials

If `DEMO_MODE=true`, the following accounts are automatically seeded into the database:

**Admin:**
- Email: `admin@ezfinanz.demo`
- Password: `password123`

**Customer:**
- Email: `john@example.com`
- Password: `password123`

## API Overview

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`
- **Customer:** `GET /api/applications/me`, `POST /api/applications/:id/kyc`, `POST /api/applications/:id/eligibility`, `POST /api/applications/:id/loan`...
- **Admin:** `GET /api/admin/applications`, `POST /api/admin/applications/:id/approve`...

## Known Limitations
- The current UI implementation includes the primary Dashboards and Auth. The remaining forms (KYC, Selfie, etc.) exist as robust backend API endpoints but require additional frontend view implementation.
- Email/OTP delivery is mocked (visible in backend logs/responses) to avoid requiring external services.
- Cloudinary upload is designed but file handling logic would sit above the provided controller schemas.
"# EZFinanz" 
"# EZFinanz" 
"# EZFinanz" 
