import mongoose from 'mongoose';

async function inspectAll() {
  await mongoose.connect('mongodb://localhost:27017/medvault');
  const cols = await mongoose.connection.db.listCollections().toArray();
  for (const c of cols) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    const sample = await mongoose.connection.db.collection(c.name).findOne();
    console.log(`\n=== Collection: ${c.name} (${count} docs) ===`);
    console.log(JSON.stringify(sample, null, 2));
  }
  process.exit(0);
}
inspectAll();
