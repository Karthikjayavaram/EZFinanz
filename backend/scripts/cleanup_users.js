import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import LoanApplication from '../models/LoanApplication.js';
import AuditLog from '../models/AuditLog.js';

const run = async () => {
  try {
    await connectDB();

    console.log('----------------------------------------------------');
    console.log('1. INSPECTING DATABASE BEFORE DELETION');
    console.log('----------------------------------------------------');
    const totalUsersBefore = await User.countDocuments();
    const adminUsers = await User.find({ role: 'ADMIN' });
    const nonAdminUsers = await User.find({ role: { $ne: 'ADMIN' } });
    const totalApps = await LoanApplication.countDocuments();
    const totalLogs = await AuditLog.countDocuments();

    console.log(`Total users in DB: ${totalUsersBefore}`);
    console.log(`Admin accounts (${adminUsers.length}):`);
    adminUsers.forEach(a => console.log(`  - [${a._id}] ${a.name} (${a.email || a.phone}) | Role: ${a.role}`));

    console.log(`Customer accounts to delete (${nonAdminUsers.length}):`);
    nonAdminUsers.forEach(u => console.log(`  - [${u._id}] ${u.name} (${u.email || u.phone})`));

    console.log(`Loan Applications count in DB: ${totalApps}`);
    console.log(`Audit Logs count in DB: ${totalLogs}`);

    console.log('\n----------------------------------------------------');
    console.log('2. EXECUTING DELETION ON USERS COLLECTION (EXCEPT ADMIN)');
    console.log('----------------------------------------------------');
    const deleteResult = await User.deleteMany({ role: { $ne: 'ADMIN' } });
    console.log(`Successfully deleted ${deleteResult.deletedCount} non-admin user records from 'users' collection.`);

    console.log('\n----------------------------------------------------');
    console.log('3. DATABASE STATE AFTER DELETION');
    console.log('----------------------------------------------------');
    const remainingUsers = await User.find({});
    console.log(`Remaining users in 'users' collection (${remainingUsers.length}):`);
    remainingUsers.forEach(u => console.log(`  - [${u._id}] ${u.name} (${u.email || u.phone}) | Role: ${u.role}`));

    const remainingApps = await LoanApplication.countDocuments();
    const remainingLogs = await AuditLog.countDocuments();
    console.log(`Remaining Loan Applications in 'loanapplications' collection: ${remainingApps}`);
    console.log(`Remaining Audit Logs in 'auditlogs' collection: ${remainingLogs}`);

    // Check sample application populate behavior
    const sampleApp = await LoanApplication.findOne({}).populate('userId', 'name email phone');
    if (sampleApp) {
      console.log('\nSample Loan Application after user deletion:');
      console.log(`  - App Number: ${sampleApp.applicationNumber}`);
      console.log(`  - Stored userId ObjectId: ${sampleApp.userId?._id || sampleApp.get('userId')}`);
      console.log(`  - Populated userId object:`, sampleApp.userId);
      console.log(`  - Stored KYC Full Name: ${sampleApp.kyc?.fullName}`);
    }

    console.log('\n----------------------------------------------------');
    console.log('OPERATION COMPLETED SUCCESSFULLY');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup script:', error);
    process.exit(1);
  }
};

run();
