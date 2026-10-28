import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '..', 'data', 'backup');

/**
 * Read-Only Target Database Inspector
 * - Connects to TARGET_MONGODB_URI
 * - Lists collections and current document counts
 * - Detects any existing data or potential overlaps with backup
 * - Strictly 100% READ-ONLY (zero writes)
 */
async function inspectDestinationDatabase() {
  const targetUri = process.env.TARGET_MONGODB_URI || process.env.MONGODB_URI;

  console.log('===========================================================');
  console.log('  DESTINATION MONGODB DATABASE INSPECTION (READ-ONLY)');
  
  if (!targetUri) {
    console.error('\n[Error] No target MongoDB URI specified.');
    console.error('Please configure TARGET_MONGODB_URI:');
    console.error('  $env:TARGET_MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/medvault"');
    process.exit(1);
  }

  const maskedUri = targetUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`  Target Database URI: ${maskedUri}`);
  console.log('===========================================================\n');

  try {
    console.log('[Connecting] Establishing connection to target cluster...');
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 10000 });
    
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    console.log(`✓ Connected to Database: [${dbName}] on [${host}]\n`);

    const collectionsOnTarget = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collectionsOnTarget.map(c => c.name);

    console.log(`Target database currently contains ${collectionNames.length} collections:`, collectionNames);

    const manifestPath = path.join(backupDir, 'manifest.json');
    const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) : null;

    const report = [];

    const expectedCollections = [
      'users',
      'appointments',
      'conversations',
      'messages',
      'records',
      'prescriptions',
      'labreports',
      'announcements'
    ];

    for (const colName of expectedCollections) {
      const existsOnTarget = collectionNames.includes(colName);
      let countOnTarget = 0;
      let sampleId = null;

      if (existsOnTarget) {
        const col = mongoose.connection.db.collection(colName);
        countOnTarget = await col.countDocuments();
        const sampleDoc = await col.findOne({}, { projection: { _id: 1, name: 1, title: 1, id: 1 } });
        if (sampleDoc) {
          sampleId = sampleDoc._id ? sampleDoc._id.toString() : (sampleDoc.id || 'N/A');
        }
      }

      const backupCount = manifest && manifest.collections ? (manifest.collections[colName] || 0) : 'N/A';

      report.push({
        Collection: colName,
        StatusOnTarget: existsOnTarget ? `EXISTS (${countOnTarget} docs)` : 'EMPTY / NOT CREATED',
        CurrentDocsInTarget: countOnTarget,
        DocsInLocalBackup: backupCount,
        SampleIdInTarget: sampleId || '-'
      });
    }

    console.log('\n--- Destination Database State vs Local Backup ---');
    console.table(report);

    // If users collection exists, give role breakdown
    if (collectionNames.includes('users')) {
      const usersCol = mongoose.connection.db.collection('users');
      const doctorCount = await usersCol.countDocuments({ role: 'DOCTOR' });
      const patientCount = await usersCol.countDocuments({ role: 'PATIENT' });
      const adminCount = await usersCol.countDocuments({ role: 'ADMIN' });
      console.log('\n--- Target Database User Roles Breakdown ---');
      console.log(`  DOCTOR  : ${doctorCount}`);
      console.log(`  PATIENT : ${patientCount}`);
      console.log(`  ADMIN   : ${adminCount}`);
      console.log(`  TOTAL   : ${await usersCol.countDocuments()}`);
    }

    console.log('\n✓ Destination inspection finished cleanly. 0 writes performed.');
  } catch (err) {
    console.error('\n[Error] Destination inspection failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Disconnected] Target database connection closed.');
  }
}

inspectDestinationDatabase();

