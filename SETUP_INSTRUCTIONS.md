# 🚀 Quick Setup Instructions

## ⚡ Immediate Setup (5 minutes)

### 1. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://user:password@localhost:5432/pharmacy_db
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Database Setup**
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed with sample data
npm run prisma:seed
```

### 4. **Start Development Server**
```bash
npm run dev
```

Visit: http://localhost:3000

## 🔧 Troubleshooting

### Prisma Version Issue
If you see Prisma 7.x warnings, run:
```bash
npm install @prisma/client@5.22.0 prisma@5.22.0
npm run prisma:generate
```

### Database Connection
Make sure PostgreSQL is running:
```bash
# Using Docker (recommended)
npm run docker:dev

# Or install PostgreSQL locally
```

## 👤 Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|---------|
| Admin | admin@pharmacy.com | admin123 | Full system |
| Pharmacist | pharmacist@pharmacy.com | admin123 | Medicine management |
| Customer | customer@example.com | admin123 | Shopping |

## 🎯 Key URLs

- **Homepage:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin/dashboard
- **Shop Catalog:** http://localhost:3000/shop/catalog
- **Customer Dashboard:** http://localhost:3000/dashboard

## ✅ Verification

Run the setup verification:
```bash
node scripts/verify-setup.js
```

## 🆘 Need Help?

1. Check the full README.md for detailed instructions
2. Review DEPLOYMENT.md for production setup
3. See PROJECT_SUMMARY.md for complete feature list

**The platform is ready to use immediately after setup!** 🎉