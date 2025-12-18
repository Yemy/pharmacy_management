import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', description: 'System Administrator' },
    }),
    prisma.role.upsert({
      where: { name: 'PHARMACIST' },
      update: {},
      create: { name: 'PHARMACIST', description: 'Licensed Pharmacist' },
    }),
    prisma.role.upsert({
      where: { name: 'STAFF' },
      update: {},
      create: { name: 'STAFF', description: 'Pharmacy Staff' },
    }),
    prisma.role.upsert({
      where: { name: 'CUSTOMER' },
      update: {},
      create: { name: 'CUSTOMER', description: 'Customer' },
    }),
  ]);

  console.log('✅ Roles created');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pharmacy.com' },
    update: {},
    create: {
      email: 'admin@pharmacy.com',
      name: 'Admin User',
      password: hashedPassword,
      roleId: roles[0].id, // ADMIN
      isVerified: true,
    },
  });

  // Create pharmacist user
  const pharmacistUser = await prisma.user.upsert({
    where: { email: 'pharmacist@pharmacy.com' },
    update: {},
    create: {
      email: 'pharmacist@pharmacy.com',
      name: 'Dr. Sarah Johnson',
      password: hashedPassword,
      roleId: roles[1].id, // PHARMACIST
      isVerified: true,
    },
  });

  // Create customer user
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Doe',
      password: hashedPassword,
      roleId: roles[3].id, // CUSTOMER
      isVerified: true,
    },
  });

  console.log('✅ Users created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'pain-relief' },
      update: {},
      create: { name: 'Pain Relief', slug: 'pain-relief' },
    }),
    prisma.category.upsert({
      where: { slug: 'antibiotics' },
      update: {},
      create: { name: 'Antibiotics', slug: 'antibiotics' },
    }),
    prisma.category.upsert({
      where: { slug: 'vitamins' },
      update: {},
      create: { name: 'Vitamins & Supplements', slug: 'vitamins' },
    }),
    prisma.category.upsert({
      where: { slug: 'cold-flu' },
      update: {},
      create: { name: 'Cold & Flu', slug: 'cold-flu' },
    }),
    prisma.category.upsert({
      where: { slug: 'digestive' },
      update: {},
      create: { name: 'Digestive Health', slug: 'digestive' },
    }),
  ]);

  console.log('✅ Categories created');

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'PharmaCorp Ltd',
        email: 'orders@pharmacorp.com',
        phone: '+1-555-0101',
        contactInfo: '123 Medical District, Health City',
      },
    }),
    prisma.supplier.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'MediSupply Inc',
        email: 'supply@medisupply.com',
        phone: '+1-555-0102',
        contactInfo: '456 Pharma Avenue, Medicine Town',
      },
    }),
  ]);

  console.log('✅ Suppliers created');

  // Create medicines
  const medicines = [
    {
      name: 'Paracetamol 500mg',
      slug: 'paracetamol-500mg',
      description: 'Pain relief and fever reducer. Safe for adults and children over 12.',
      sku: 'PAR500',
      price: 5.99,
      categoryId: categories[0].id,
      unit: 'tablet',
    },
    {
      name: 'Ibuprofen 400mg',
      slug: 'ibuprofen-400mg',
      description: 'Anti-inflammatory pain reliever for headaches, muscle pain, and arthritis.',
      sku: 'IBU400',
      price: 8.99,
      categoryId: categories[0].id,
      unit: 'tablet',
    },
    {
      name: 'Amoxicillin 250mg',
      slug: 'amoxicillin-250mg',
      description: 'Antibiotic for bacterial infections. Prescription required.',
      sku: 'AMX250',
      price: 15.99,
      categoryId: categories[1].id,
      unit: 'capsule',
    },
    {
      name: 'Vitamin D3 1000IU',
      slug: 'vitamin-d3-1000iu',
      description: 'Essential vitamin for bone health and immune system support.',
      sku: 'VTD1000',
      price: 12.99,
      categoryId: categories[2].id,
      unit: 'tablet',
    },
    {
      name: 'Multivitamin Complex',
      slug: 'multivitamin-complex',
      description: 'Complete daily vitamin and mineral supplement.',
      sku: 'MVC001',
      price: 24.99,
      categoryId: categories[2].id,
      unit: 'tablet',
    },
    {
      name: 'Cough Syrup 100ml',
      slug: 'cough-syrup-100ml',
      description: 'Effective relief for dry and productive coughs.',
      sku: 'CSY100',
      price: 9.99,
      categoryId: categories[3].id,
      unit: 'ml',
    },
    {
      name: 'Throat Lozenges',
      slug: 'throat-lozenges',
      description: 'Soothing relief for sore throat and cough.',
      sku: 'TLZ001',
      price: 6.99,
      categoryId: categories[3].id,
      unit: 'lozenge',
    },
    {
      name: 'Antacid Tablets',
      slug: 'antacid-tablets',
      description: 'Fast relief from heartburn and indigestion.',
      sku: 'ANT001',
      price: 7.99,
      categoryId: categories[4].id,
      unit: 'tablet',
    },
  ];

  for (const medicineData of medicines) {
    await prisma.medicine.upsert({
      where: { slug: medicineData.slug },
      update: {},
      create: medicineData,
    });
  }

  console.log('✅ Medicines created');

  // Create inventory for medicines
  const createdMedicines = await prisma.medicine.findMany();
  
  for (const medicine of createdMedicines) {
    // Create 2-3 inventory batches per medicine
    const batchCount = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < batchCount; i++) {
      const quantity = Math.floor(Math.random() * 100) + 50;
      const unitPrice = medicine.price * 0.6; // Cost price
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 24) + 6); // 6-30 months
      
      await prisma.inventory.create({
        data: {
          medicineId: medicine.id,
          supplierId: suppliers[Math.floor(Math.random() * suppliers.length)].id,
          batchNumber: `BATCH${medicine.id}${i + 1}${Date.now().toString().slice(-4)}`,
          quantity,
          unitPrice,
          expiryDate,
        },
      });
    }
  }

  console.log('✅ Inventory created');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('👤 Test Users:');
  console.log('Admin: admin@pharmacy.com / admin123');
  console.log('Pharmacist: pharmacist@pharmacy.com / admin123');
  console.log('Customer: customer@example.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });