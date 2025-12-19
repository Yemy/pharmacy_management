# 🏥 MediCare - Complete Pharmacy Management & E-Commerce Platform

A comprehensive, full-stack pharmacy management system built with Next.js 16, featuring both customer-facing e-commerce capabilities and complete administrative management tools.

## ✨ Features

### 🛒 **Customer E-Commerce Platform**
- **Modern Landing Page** - Professional design with hero section, features, and testimonials
- **Product Catalog** - Browse medicines by category with advanced filtering and search
- **Shopping Cart** - Add to cart, quantity management, and secure checkout
- **Order Management** - Track order status from pending to delivered
- **Prescription Upload** - Upload and manage prescriptions with verification system
- **User Profiles** - Manage personal information and view order history
- **Dark/Light Theme** - System preference detection with manual toggle
- **Mobile Responsive** - Optimized for all devices with slide-in navigation

### 🔐 **Authentication & Security**
- **Role-Based Access** - Admin, Pharmacist, Staff, and Customer roles
- **Secure Authentication** - NextAuth.js with credential-based login
- **Password Management** - Change password and forgot password functionality
- **Account Verification** - Email verification system
- **Session Management** - Secure session handling and automatic logout

### 👨‍💼 **Admin Management System**
- **Dashboard Analytics** - Real-time metrics, revenue tracking, and key performance indicators
- **Medicine Management** - Complete CRUD operations with inventory tracking
- **Inventory Control** - Batch tracking, expiration monitoring, and stock alerts
- **Order Processing** - Status management (Pending → Paid → Packed → Delivered → Rejected)
- **User Management** - Role assignment, account control, and user verification
- **Prescription Verification** - Review and approve customer prescriptions
- **Reports & Analytics** - Business intelligence and performance metrics
- **Audit Logging** - Complete action tracking for compliance

### 📊 **Smart Notifications & Alerts**
- **Low Stock Alerts** - Configurable minimum stock thresholds
- **Expiration Warnings** - 30-day advance notifications for expiring medicines
- **Real-time Updates** - Live dashboard updates and notifications
- **Status Tracking** - Order and prescription status changes

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication and session management
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Robust relational database
- **Server Actions** - Modern server-side operations

### **Database Schema**
- **11 Interconnected Models** - Users, Roles, Medicines, Categories, Inventory, Orders, Prescriptions, Suppliers, Audit Logs
- **Soft Deletes** - Data preservation with logical deletion
- **Comprehensive Relationships** - Foreign keys and proper indexing
- **Audit Trail** - Complete action logging for compliance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pharmacy-platform.git
   cd pharmacy-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials and NextAuth secret.

4. **Database setup**
   ```bash
   npm run setup
   ```
   This will generate Prisma client, run migrations, and seed the database.

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 🔑 Demo Accounts

The system comes with pre-seeded demo accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@pharmacy.com | password123 | Full system access |
| **Pharmacist** | pharmacist@pharmacy.com | password123 | Medicine & prescription management |
| **Staff** | staff@pharmacy.com | password123 | Order & inventory management |
| **Customer** | customer@pharmacy.com | password123 | Shopping & prescriptions |

## 📱 Key Pages & Features

### **Public Pages**
- `/` - Landing page with features and testimonials
- `/shop/catalog` - Product catalog with filtering
- `/shop/product/[slug]` - Individual product pages
- `/shop/cart` - Shopping cart and checkout

### **Customer Dashboard**
- `/dashboard` - Customer overview and recent orders
- `/profile` - Profile management and settings
- `/prescriptions` - Upload and manage prescriptions
- `/shop/orders` - Order history and tracking

### **Admin Panel**
- `/admin/dashboard` - Analytics and key metrics
- `/admin/medicines` - Medicine CRUD and stock management
- `/admin/inventory` - Batch tracking and expiration monitoring
- `/admin/orders` - Order processing and status management
- `/admin/users` - User management and role assignment
- `/admin/prescriptions` - Prescription verification system
- `/admin/reports` - Business analytics and reports

## 🎨 Design Features

- **Modern UI/UX** - Clean, professional design with intuitive navigation
- **Dark Mode Support** - System preference detection with manual toggle
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **Accessibility** - WCAG compliant with proper ARIA labels
- **Loading States** - Skeleton loaders and progress indicators
- **Error Handling** - Graceful error messages and fallbacks

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:studio # Open Prisma Studio
npm run prisma:seed  # Seed database with demo data
```

### **Database Operations**
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed with demo data
```

## 📦 Deployment

### **Docker Support**
```bash
# Development
npm run docker:dev

# Production
npm run docker:prod
```

### **Environment Variables**
Required environment variables for production:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**MediCare** - Revolutionizing pharmacy management with modern technology 💊✨