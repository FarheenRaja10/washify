# 🚗 Washify - Car Wash Platform

Washify is a scalable dual-platform SaaS product that connects consumers with car wash operators through a modern, efficient platform.

## 🎯 Platform Overview

- **Consumer Mobile App**: React Native app for booking car wash services
- **Business Dashboard**: Next.js web dashboard for car wash operators
- **Shared Backend**: Node.js API with PostgreSQL database
- **Shared Libraries**: Common types, utilities, and configurations

## 🧱 Tech Stack

### Frontend
- **Web Dashboard**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Mobile App**: React Native (planned after MVP)

### Backend
- **API**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: next-auth (web), Passport.js (API)

### State & Data
- **State Management**: Zustand (web), Redux Toolkit (mobile)
- **Data Fetching**: React Query (TanStack)
- **Validation**: Zod
- **Real-time**: Socket.IO (optional)

### Infrastructure
- **File Upload**: Multer + local disk/S3
- **Deployment**: Docker-ready
- **CI/CD**: GitHub Actions ready

## 📁 Project Structure

```
washify/
├── apps/
│   ├── web/                 # Next.js dashboard for operators
│   └── app/                 # React Native app (future)
├── packages/
│   ├── backend/             # Express API server
│   ├── db/                  # Prisma schema & migrations
│   ├── shared/              # Shared types & utilities
│   └── config/              # Shared configurations
├── .env                     # Environment variables
├── docker-compose.yml       # Local development services
└── package.json             # Monorepo configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ (or use Docker)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd washify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

4. **Database setup**
   ```bash
   # Start PostgreSQL (if using Docker)
   docker-compose up -d postgres
   
   # Run database migrations
   npm run db:migrate
   
   # Generate Prisma client
   npm run db:generate
   ```

5. **Start development servers**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm run dev:web      # Web dashboard at http://localhost:3000
   npm run dev:backend  # API server at http://localhost:5000
   ```

## 📝 Available Scripts

### Development
- `npm run dev` - Start all development servers
- `npm run dev:web` - Start Next.js web dashboard
- `npm run dev:backend` - Start Express API server

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Building
- `npm run build` - Build all applications
- `npm run build:web` - Build web dashboard
- `npm run build:backend` - Build API server

### Quality Assurance
- `npm run lint` - Lint all packages
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run all tests

### Utilities
- `npm run clean` - Clean all node_modules and build artifacts

## 🗃️ Database Schema

### Core Entities
- **Users**: Authentication and profile management
- **Bookings**: Car wash appointment scheduling
- **Services**: Available car wash packages
- **Operators**: Business accounts and locations

## 🔐 Authentication

- **Web Dashboard**: next-auth with credentials provider
- **Mobile API**: Passport.js with JWT tokens
- **Shared validation**: Zod schemas for consistent data validation

## 🎨 UI Components

The web dashboard uses shadcn/ui components with Tailwind CSS for a modern, consistent design system.

## 📱 Mobile App (Planned)

The React Native mobile app will be developed after the web MVP, sharing the same backend and types.

## 🐳 Docker Development

```bash
# Start all services (PostgreSQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

---

**Happy coding! 🚀** 