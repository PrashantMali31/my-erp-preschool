# Preschool ERP System

A comprehensive multi-tenant SaaS application for managing preschools.

## Features

- **Multi-tenancy**: High data isolation between different schools.
- **Student Management**: CRUD operations, attendance, and performance tracking.
- **Teacher Management**: Staff records, qualifications, and class assignments.
- **Attendance Tracking**: Daily attendance for students.
- **Fee Management**: Track collections and generate reports.
- **Announcements**: Internal communication system.
- **Role-Based Access Control**: Admin, Teacher, and Parent roles.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Hero UI, Framer Motion, Zustand.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Zod.
- **Deployment**: Docker, Docker Compose.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Local Development

1. **Install dependencies**:
   ```bash
   bun run install:all
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env` in both `frontend` and `backend` directories and update the values.

3. **Run the application**:
   ```bash
   bun run dev
   ```
   The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

4. **Seed the database**:
   ```bash
   bun run seed
   ```

### Docker Deployment

To run the entire stack using Docker:

```bash
docker-compose up --build
```

## API Documentation

The API documentation is available via Swagger at `http://localhost:5000/api/docs`.

## Security

- **JWT Authentication**: Secure token-based auth.
- **Helmet**: Security headers for Express.
- **Rate Limiting**: Protection against brute-force attacks.
- **NoSQL Injection Protection**: Sanitization middleware for MongoDB queries.
- **Input Validation**: Strict schema validation using Zod.

## License

This project is licensed under the MIT License.
