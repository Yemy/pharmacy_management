# 🏥 Pharmacy Management & E-Commerce Platform

A comprehensive, production-ready pharmacy management system built with Next.js, featuring both administrative tools and customer e-commerce functionality.

## 🚀 Features

### 🏪 Public E-Commerce
- **Modern Landing Page** - SEO-optimized with trust indicators
- **Product Catalog** - Search, filter, and browse medicines
- **Shopping Cart** - Add to cart, quantity management
- **Secure Checkout** - Order placement and tracking
- **User Authentication** - Registration and login system

### 👨‍⚕️ Pharmacy Management (Admin)
- **Medicine Management** - CRUD operations for medicines and categories
- **Inventory Tracking** - Stock levels, batch numbers, expiry dates
- **Order Processing** - Order status management (Pending → Paid → Packed → Delivered)
- **User Management** - Role-based access control (Admin, Pharmacist, Staff, Customer)
- **Reports & Analytics** - Sales summaries, stock alerts, expiry tracking
- **Audit Logging** - Complete activity tracking for compliance

### 🔐 Security & Compliance
- **Role-Based Authorization** - Secure access control
- **Input Validation** - Zod schemas for data integrity
- **Audit Trails** - Complete activity logging
- **Secure Authentication** - NextAuth with JWT tokens
- **Health Data Ready** - Designed for compliance requirements

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js (Credentials + JWT)
- **Styling:** Tailwind CSS
- **State Management:** React Context + Server Actions
- **Deployment:** Docker + Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+ (or Docker)
- npm or yarn

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone and setup environment:**
```bash
git clone <repository-url>
cd pharmacy-platform
cp .env.example .env
```

2. **Start with Docker Compose:**
```bash
# Development (database only)
docker-compose -f docker-compose.dev.yml up -d

# Or full production setup
docker-compose up -d
```

3. **Setup database (if using dev compose):**
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Option 2: Local Development

1. **Clone and install:**
```bash
git clone <repository-url>
cd pharmacy-platform
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Database setup:**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with sample data
npm run prisma:seed
```

4. **Start development server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 👤 Test Accounts

After seeding, you can login with:

| Role | Email | Password | Access |
|------|-------|----------|---------|
| **Admin** | admin@pharmacy.com | admin123 | Full system access |
| **Pharmacist** | pharmacist@pharmacy.com | admin123 | Medicine & order management |
| **Customer** | customer@example.com | admin123 | Shopping and orders |

## 📁 Project Structure

```
pharmacy-platform/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin dashboard routes
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public pages
│   ├── (shop)/            # E-commerce pages
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
├── actions/               # Server Actions
├── prisma/                # Database schema and migrations
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🗃️ Database Schema

Key entities:
- **Users** - Authentication and role management
- **Medicines** - Product catalog with categories
- **Inventory** - Stock tracking with batches and expiry
- **Orders** - Customer orders with status flow
- **Audit Logs** - Activity tracking for compliance

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:seed     # Seed with sample data
npm run setup           # Generate + seed (first time setup)

# Code Quality
npm run lint            # Run ESLint
```

## 🐳 Docker Deployment

### Development
```bash
# Start PostgreSQL only
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

## 🌍 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pharmacy_db

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: Stripe, SMTP, etc.
```

## 🔐 Security Features

- **Authentication:** Secure login with bcrypt password hashing
- **Authorization:** Role-based route protection
- **Input Validation:** Zod schemas for all forms
- **Audit Logging:** Complete activity tracking
- **SQL Injection Protection:** Prisma ORM with parameterized queries
- **XSS Protection:** React's built-in escaping

## 📊 Key Features Implemented

✅ **Complete Authentication System**  
✅ **Role-Based Access Control**  
✅ **Medicine & Category Management**  
✅ **Inventory Tracking with Batches**  
✅ **Order Management System**  
✅ **Shopping Cart & Checkout**  
✅ **Admin Dashboard with Analytics**  
✅ **Audit Logging System**  
✅ **Responsive UI Design**  
✅ **Docker Deployment Ready**  

## 🚧 Production Considerations

Before deploying to production:

1. **Security:**
   - Change all default passwords
   - Use strong NEXTAUTH_SECRET
   - Enable HTTPS
   - Configure CORS properly

2. **Database:**
   - Use managed PostgreSQL service
   - Set up regular backups
   - Configure connection pooling

3. **Monitoring:**
   - Add error tracking (Sentry)
   - Set up logging aggregation
   - Monitor database performance

4. **Compliance:**
   - Review audit logging requirements
   - Implement data retention policies
   - Add prescription verification workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include error logs and environment details

