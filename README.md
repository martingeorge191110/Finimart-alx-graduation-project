# Finimart API Server

## Overview
This is the backend API server for the Finimart project. It provides RESTful endpoints for user authentication, company and admin management, product catalog, orders, invoices, and more. The API is designed for scalability, security, and performance, using modern technologies and best practices.

## Features
- User and admin authentication (JWT, refresh tokens, cookies)
- Company and user management
- Product catalog and filtering
- Orders, invoices, and e-wallet support
- Favourites and cart management
- Admin dashboard and statistics
- Role-based access control
- Caching with Redis
- Email notifications (via Gmail)
- API documentation with Swagger (OpenAPI 3.0)

## Tech Stack
- **Node.js** (TypeScript)
- **Express.js**
- **Prisma ORM** (PostgreSQL)
- **Redis** (caching)
- **Swagger** (API docs)
- **Cloudinary** (image uploads)
- **Nodemailer** (email)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database
- Redis server

### Installation
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=3000
   HOSTNAME=localhost
   PROTOCOL=http
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
   REPLICA_URL=postgresql://<user>:<password>@<host>:<port>/<db>
   REDIS_URL=redis://localhost:6379
   JWT_KEY=your_jwt_secret
   GMAIL_USER=your_gmail@gmail.com
   GMAIL_PASS=your_gmail_app_password
   CLOUDINARY_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
   > **Note:** Replace values with your actual credentials.

4. **Set up the database:**
   - Run migrations to create the database schema:
     ```bash
     npx prisma migrate dev
     ```
   - (Optional) Generate Prisma client:
     ```bash
     npx prisma generate
     ```

### Running the Application
- **Development mode (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production build:**
  ```bash
  npm run build
  npm start
  ```

## API Documentation
- Swagger UI is available at: `http://<HOSTNAME>:<PORT>/api/v1/docs-url/`
- The OpenAPI spec is generated from route annotations in the codebase.

## Project Structure
- `src/` — Main source code
  - `apis/` — All API routes, controllers, services, and validators
  - `config/` — Configuration files (DB, Redis, Swagger)
  - `middlewares/` — Express middlewares (auth, error handling, etc.)
  - `utilies/` — Utility classes and helpers
- `prisma/` — Prisma schema and migrations

## Contribution
- Fork the repo and create a feature branch
- Follow code style and add tests where possible
- Open a pull request with a clear description

## Support
For questions or support, please open an issue or contact the maintainer.
