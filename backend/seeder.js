import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';
import LoanApplication from './models/LoanApplication.js';
import AuditLog from './models/AuditLog.js';
import connectDB from './config/db.js';

export const ensureAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@ezfinanz.com';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({ 
      $or: [{ email: adminEmail }, { role: 'ADMIN' }] 
    });

    if (!existingAdmin) {
      const admin = new User({
        name: 'EZFinanz Admin',
        email: adminEmail,
        phone: '9999999999',
        password: adminPassword,
        role: 'ADMIN',
        emailVerified: true,
        phoneVerified: true,
      });

      await admin.save();
      console.log(`[AUTH] Default Admin account created successfully: ${adminEmail}`);
    } else {
      // Ensure existing admin has role ADMIN
      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        await existingAdmin.save();
      }
      console.log(`[AUTH] Admin account ready (${existingAdmin.email})`);
    }
  } catch (error) {
    console.error(`[AUTH] Error ensuring admin user: ${error.message}`);
  }
};

export const seedDemoData = async () => {
  try {
    await ensureAdminUser();

    const appsCount = await LoanApplication.countDocuments();
    if (appsCount > 0) {
      console.log('Data already exists, skipping demo seed...');
      return;
    }

    const demoAdmin = await User.findOne({ email: 'admin@ezfinanz.demo' });
    if (!demoAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@ezfinanz.demo',
        phone: '9999999998',
        password: 'password123',
        role: 'ADMIN',
        emailVerified: true,
        phoneVerified: true,
      });
      await adminUser.save();
    }

    console.log('Demo Data Seeded successfully!');
  } catch (error) {
    console.error(`Error Seeding: ${error.message}`);
  }
};

// If run directly from CLI: node seeder.js
if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  connectDB().then(async () => {
    await ensureAdminUser();
    await seedDemoData();
    console.log('Seeder finished.');
    process.exit(0);
  });
}
