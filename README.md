# Resource Sharing Platform

🌐 **Live:** https://resource-sharing-app-2jp6-1idct30ac-mr-shelby-45s-projects.vercel.app/login

A peer-to-peer community resource sharing platform built for modern planned communities like Konza City and Tatu City in Kenya, starting with item lending and expanding towards a full community resource exchange including skills and professional services.

## The Problem

Rapid urbanisation is driving the growth of large, planned satellite cities, masterplanned communities where thousands of people live in close proximity but don't necessarily know or trust each other. One of the underutilised advantages of dense communities is the ability to pool resources, not just physical items, but human expertise. A community of thousands likely has electricians, lawyers, doctors, mechanics, and chefs living within walking distance of each other, with no structured way to connect.

Currently, informal resource sharing relies on WhatsApp groups, word of mouth, and personal trust networks, with no structured way to track who borrowed what, manage availability, verify community membership, or handle disputes.

## The Solution

This platform introduces a structured, trust-based resource sharing system for communities. In its current phase, residents can list items they own, make them available for borrowing, and manage requests through a controlled approval workflow. The architecture is designed from the ground up to evolve, the same booking, permissions, and trust infrastructure that manages item lending will extend naturally to skill and service listings, community verification, and eventually payments.

## Tech Stack

- Next.js 15, full-stack framework with App Router, server components, and server actions
- TypeScript, strict typing for safer permission logic and data contracts
- PostgreSQL (Neon), relational database with ACID compliance for transactional integrity
- Prisma 7, type-safe ORM with migrations and relation management
- JWT with HTTP-only cookies, stateless authentication resistant to XSS attacks
- bcryptjs, password hashing

## Architecture Decisions

**Modular monolith over microservices** — financial transactions require strong consistency. A single database with ACID transactions is simpler to reason about and debug than distributed systems.

**Derived availability over stored boolean** — item availability is computed from approved bookings rather than stored as a separate field. This prevents synchronisation bugs and maintains a single source of truth.

**Separated auth and authorisation** — requireAuth only verifies identity. Permission functions handle capability checks separately. Changing the auth mechanism does not affect business logic.

**Extracted permission layer** — role and ownership checks live in src/lib/permissions.ts rather than inside route handlers. This makes rules reusable, testable, and easy to audit.

**Database-level constraints** — a partial unique index prevents two approved bookings for the same item even if application logic is bypassed.

**Transactions for booking approval** — approving a booking, rejecting competing bookings, and updating availability happen atomically. Either all succeed or none do.

## Current Features

- User registration and login with JWT authentication
- Role-based access, owners, borrowers, admins
- Item listing, creation, and deletion
- Booking requests, approval, and rejection
- Automatic rejection of competing bookings on approval
- Availability derived from booking state
- Owner dashboard with pending booking requests
- Borrower dashboard with available items and booking history

## Expected Features

- Skill sharing, extend the platform beyond physical items to human resources. Community members can list professional skills including IT, legal, medical, culinary, and mechanical services, making expertise accessible within the community at agreed rates or through a barter system
- Payment integration for security deposits, lending fees, and service payments
- Reputation and trust scoring based on borrowing and service history
- Location-based discovery within communities
- Community verification, ensuring only verified residents can access the platform
- Notifications for booking requests and approvals
- Admin dashboard for community managers
- Multi-community support, one platform serving multiple satellite cities

## Getting Started

### Prerequisites
- Node.js 18+
- A Neon account or any PostgreSQL database

### Setup

Clone the repository and install dependencies:

    git clone https://github.com/mr-shelby-45/resource-sharing-app.git
    cd resource-sharing
    npm install

Copy the environment variables:

    cp .env.example .env

Fill in your values in .env, then run migrations and seed:

    npx prisma migrate dev
    npx prisma db seed

Start the development server:

    npm run dev

## API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Login | No |
| POST | /api/auth/logout | Logout | No |
| GET | /api/auth/me | Get current user | Yes |
| GET | /api/items | Get all items | No |
| POST | /api/items | Create an item | Owner |
| DELETE | /api/items/:id | Delete an item | Owner |
| GET | /api/bookings | Get all bookings | Yes |
| POST | /api/bookings | Create a booking | Borrower |
| PATCH | /api/bookings/:id | Approve or reject booking | Owner |