#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Pharmacy Platform Setup...\n');

// Check essential files
const essentialFiles = [
  'package.json',
  'prisma/schema.prisma',
  'app/layout.tsx',
  'app/page.tsx',
  'lib/auth.ts',
  'lib/prisma.ts',
  '.env.example',
  'README.md'
];

let allFilesExist = true;

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n📁 Project Structure:');
const directories = [
  'app/(admin)',
  'app/(auth)', 
  'app/(public)',
  'app/(shop)',
  'components',
  'actions',
  'lib',
  'prisma',
  'types'
];

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - MISSING`);
  }
});

console.log('\n🎯 Key Features Implemented:');
const features = [
  { name: 'Landing Page', file: 'app/page.tsx' },
  { name: 'Authentication', file: 'lib/auth.ts' },
  { name: 'Admin Dashboard', file: 'app/(admin)/admin/dashboard/page.tsx' },
  { name: 'Medicine Management', file: 'app/(admin)/admin/medicines/page.tsx' },
  { name: 'Inventory Tracking', file: 'app/(admin)/admin/inventory/page.tsx' },
  { name: 'Order Management', file: 'app/(admin)/admin/orders/page.tsx' },
  { name: 'Shop Catalog', file: 'app/(shop)/shop/catalog/page.tsx' },
  { name: 'Shopping Cart', file: 'app/(shop)/cart/page.tsx' },
  { name: 'Checkout Process', file: 'app/(shop)/checkout/page.tsx' },
  { name: 'Customer Dashboard', file: 'app/(public)/dashboard/page.tsx' }
];

features.forEach(feature => {
  if (fs.existsSync(feature.file)) {
    console.log(`✅ ${feature.name}`);
  } else {
    console.log(`❌ ${feature.name} - MISSING`);
  }
});

console.log('\n🗄️ Database Schema:');
if (fs.existsSync('prisma/schema.prisma')) {
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const models = schema.match(/model \w+/g) || [];
  console.log(`✅ ${models.length} database models defined`);
  models.forEach(model => {
    console.log(`   - ${model.replace('model ', '')}`);
  });
} else {
  console.log('❌ Prisma schema not found');
}

console.log('\n🚀 Next Steps:');
console.log('1. Copy .env.example to .env and configure your database');
console.log('2. Run: npm install');
console.log('3. Run: npm run setup');
console.log('4. Run: npm run dev');
console.log('\n📚 Documentation:');
console.log('- README.md - Setup instructions');
console.log('- DEPLOYMENT.md - Production deployment guide');
console.log('- PROJECT_SUMMARY.md - Complete feature overview');

if (allFilesExist) {
  console.log('\n🎉 Setup verification complete! All essential files are present.');
} else {
  console.log('\n⚠️  Some files are missing. Please check the setup.');
}