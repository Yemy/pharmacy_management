# 🚀 Deployment Guide

This guide covers deploying the Pharmacy Management Platform to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Configure production `DATABASE_URL`
- [ ] Set correct `NEXTAUTH_URL` for your domain
- [ ] Configure optional services (Stripe, SMTP)

### 2. Security Review
- [ ] Change all default passwords
- [ ] Review user roles and permissions
- [ ] Enable HTTPS in production
- [ ] Configure CORS if needed
- [ ] Review audit logging settings

### 3. Database Setup
- [ ] Set up PostgreSQL instance
- [ ] Configure connection pooling
- [ ] Set up automated backups
- [ ] Plan data retention policies

## 🐳 Docker Deployment (Recommended)

### Production Deployment

1. **Prepare environment:**
```bash
# Clone repository
git clone <your-repo-url>
cd pharmacy-platform

# Configure environment
cp .env.example .env
# Edit .env with production values
```

2. **Deploy with Docker Compose:**
```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f app
```

3. **Initialize database:**
```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed initial data (optional)
docker-compose exec app npm run prisma:seed
```

### Development with Docker

```bash
# Start PostgreSQL only
docker-compose -f docker-compose.dev.yml up -d

# Run app locally
npm install
npm run setup
npm run dev
```

## ☁️ Cloud Deployment Options

### Vercel + Supabase

1. **Database (Supabase):**
   - Create Supabase project
   - Get connection string
   - Set `DATABASE_URL` in Vercel

2. **Application (Vercel):**
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

### AWS ECS + RDS

1. **Database (RDS):**
   - Create PostgreSQL RDS instance
   - Configure security groups
   - Get connection string

2. **Application (ECS):**
   - Build Docker image
   - Push to ECR
   - Create ECS service
   - Configure load balancer

### DigitalOcean App Platform

1. **Create app from GitHub**
2. **Configure environment variables**
3. **Add PostgreSQL database**
4. **Deploy automatically**

## 🔧 Manual Server Deployment

### Prerequisites
- Ubuntu 20.04+ or similar
- Node.js 18+
- PostgreSQL 13+
- Nginx (recommended)
- PM2 (process manager)

### Steps

1. **Install dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2
```

2. **Setup database:**
```bash
sudo -u postgres createuser --interactive
sudo -u postgres createdb pharmacy_db
```

3. **Deploy application:**
```bash
# Clone and setup
git clone <your-repo-url>
cd pharmacy-platform
npm install

# Build application
npm run build

# Setup database
npm run prisma:generate
npm run prisma:migrate:prod
npm run prisma:seed

# Start with PM2
pm2 start npm --name "pharmacy-app" -- start
pm2 save
pm2 startup
```

4. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### Health Checks

Create health check endpoint:
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### Monitoring Setup

1. **Application Monitoring:**
   - Set up error tracking (Sentry)
   - Monitor performance metrics
   - Set up uptime monitoring

2. **Database Monitoring:**
   - Monitor connection pool
   - Track query performance
   - Set up backup verification

3. **Infrastructure Monitoring:**
   - CPU and memory usage
   - Disk space monitoring
   - Network performance

### Backup Strategy

1. **Database Backups:**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump pharmacy_db > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

2. **Application Backups:**
   - Code: Git repository
   - Uploads: Regular file system backup
   - Configuration: Environment variables backup

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Check `DATABASE_URL` format
   - Verify PostgreSQL is running
   - Check firewall settings

2. **Authentication Issues:**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches domain
   - Ensure cookies are working

3. **Build Failures:**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check TypeScript errors

### Performance Optimization

1. **Database:**
   - Add appropriate indexes
   - Configure connection pooling
   - Monitor slow queries

2. **Application:**
   - Enable Next.js caching
   - Optimize images
   - Use CDN for static assets

3. **Infrastructure:**
   - Use load balancer for high traffic
   - Configure auto-scaling
   - Monitor resource usage

## 📞 Support

For deployment issues:
1. Check application logs
2. Review database connectivity
3. Verify environment configuration
4. Check system resources

Remember to test thoroughly in a staging environment before production deployment!