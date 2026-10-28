import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medvault';
  console.log('Connecting to:', uri);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to MongoDB!');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n--- Collections Found ---');
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(`${c.name}: ${count} documents`);
    }

    // Inspect user roles if users collection exists
    if (collections.some(c => c.name === 'users')) {
      const usersCol = mongoose.connection.db.collection('users');
      const doctorCount = await usersCol.countDocuments({ role: 'DOCTOR' });
      const patientCount = await usersCol.countDocuments({ role: 'PATIENT' });
      const adminCount = await usersCol.countDocuments({ role: 'ADMIN' });
      console.log('\n--- User Breakdown ---');
      console.log(`DOCTOR: ${doctorCount}`);
      console.log(`PATIENT: ${patientCount}`);
      console.log(`ADMIN: ${adminCount}`);
      console.log(`Total: ${await usersCol.countDocuments()}`);

      const sampleDoc = await usersCol.findOne({ role: 'DOCTOR' }, { projection: { name: 1, email: 1, specialty: 1, city: 1 } });
      console.log('Sample Doctor:', sampleDoc);
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
