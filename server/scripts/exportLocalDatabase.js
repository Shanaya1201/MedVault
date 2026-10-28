import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '..', 'data', 'backup');

async function exportLocalDatabase() {
  const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/medvault';
  console.log(`[Export] Connecting to local database: ${localUri}`);

  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Export] Connected successfully.');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const collections = [
      'users',
      'appointments',
      'conversations',
      'messages',
      'records',
      'prescriptions',
      'labreports',
      'announcements'
    ];

    const exportManifest = {
      exportedAt: new Date().toISOString(),
      sourceDatabase: 'medvault',
      collections: {}
    };

    for (const colName of collections) {
      const col = mongoose.connection.db.collection(colName);
      const docs = await col.find({}).toArray();
      const filePath = path.join(backupDir, `${colName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
      exportManifest.collections[colName] = docs.length;
      console.log(`[Export] Collection '${colName}': exported ${docs.length} documents -> ${filePath}`);
    }

    fs.writeFileSync(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(exportManifest, null, 2),
      'utf-8'
    );

    console.log('\n[Export] SUCCESS! Local database export completed.');
    console.log(`[Export] Backup Directory: ${backupDir}`);
  } catch (err) {
    console.error('[Export] Error exporting local database:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

exportLocalDatabase();
