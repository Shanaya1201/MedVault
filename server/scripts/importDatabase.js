import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '..', 'data', 'backup');

/**
 * Safe, Non-Destructive Database Migration Utility
 * - Never drops collections
 * - Never deletes records
 * - Never overwrites existing production records
 * - Idempotently inserts only missing documents
 * - Preserves original ObjectIds, bcrypt password hashes, and relations
 * - Defaults to DRY RUN unless --execute is explicitly supplied
 */
async function runSafeMigration() {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute');
  const isDryRun = !isExecute;

  const targetUri = process.env.TARGET_MONGODB_URI || process.env.MONGODB_URI;

  console.log('===========================================================');
  console.log('  MEDVAULT SAFE, NON-DESTRUCTIVE DATABASE MIGRATOR');
  console.log(`  Mode: ${isExecute ? 'LIVE EXECUTION (--execute enabled)' : 'DRY RUN (Simulation only, zero writes)'}`);
  
  if (!targetUri) {
    console.error('\n[Error] No target MongoDB URI provided.');
    console.error('Please configure TARGET_MONGODB_URI before running:');
    console.error('  $env:TARGET_MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/medvault"');
    process.exit(1);
  }

  // Sanitize URI for safe console logging
  const maskedUri = targetUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log(`  Target URI: ${maskedUri}`);
  console.log(`  Source Backup Directory: ${backupDir}`);
  console.log('===========================================================\n');

  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`[Migrator] Error: Backup manifest not found at ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`[Migrator] Source backup timestamp: ${manifest.exportedAt}`);
  console.log(`[Migrator] Verified collections to inspect:`, Object.keys(manifest.collections).join(', '));
  console.log('\nConnecting to target database...');

  try {
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 10000 });
    const targetDbName = mongoose.connection.name;
    const targetHost = mongoose.connection.host;
    console.log(`✓ Connected to target database: [${targetDbName}] on [${targetHost}]\n`);

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

    const migrationSummary = [];

    for (const colName of collections) {
      const filePath = path.join(backupDir, `${colName}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`[Skip] Backup file not found for '${colName}'`);
        continue;
      }

      const rawDocs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const col = mongoose.connection.db.collection(colName);

      // Inspect destination collection state
      const existingTotalInDb = await col.countDocuments();
      let alreadyExistingCount = 0;
      let toInsertDocs = [];

      for (const rawDoc of rawDocs) {
        const transformed = { ...rawDoc };

        // 1. Preserve native ObjectId
        if (transformed._id && typeof transformed._id === 'string' && /^[0-9a-fA-F]{24}$/.test(transformed._id)) {
          transformed._id = new mongoose.Types.ObjectId(transformed._id);
        }

        // 2. Preserve native Date types
        if (transformed.createdAt && typeof transformed.createdAt === 'string') {
          transformed.createdAt = new Date(transformed.createdAt);
        }
        if (transformed.updatedAt && typeof transformed.updatedAt === 'string') {
          transformed.updatedAt = new Date(transformed.updatedAt);
        }

        // 3. Check for existence by _id or unique business identifiers
        let exists = false;
        if (transformed._id) {
          const docById = await col.findOne({ _id: transformed._id });
          if (docById) exists = true;
        }

        // For users: ensure uniqueness by email as well to prevent index collision
        if (!exists && colName === 'users' && transformed.email) {
          const docByEmail = await col.findOne({ email: transformed.email });
          if (docByEmail) exists = true;
        }

        // For conversations / messages: check unique business string ID if present
        if (!exists && (colName === 'conversations' || colName === 'messages') && transformed.id) {
          const docByBizId = await col.findOne({ id: transformed.id });
          if (docByBizId) exists = true;
        }

        if (exists) {
          alreadyExistingCount++;
        } else {
          toInsertDocs.push(transformed);
        }
      }

      let insertedCount = 0;
      if (isExecute && toInsertDocs.length > 0) {
        const insertRes = await col.insertMany(toInsertDocs, { ordered: false });
        insertedCount = insertRes.insertedCount;
      } else {
        insertedCount = toInsertDocs.length; // simulated in dry run
      }

      migrationSummary.push({
        Collection: colName,
        BackupTotal: rawDocs.length,
        ExistingInDb: existingTotalInDb,
        SkippedExisting: alreadyExistingCount,
        Action: isExecute ? `Inserted ${insertedCount}` : `Would Insert ${insertedCount}`
      });

      console.log(`  ✓ Collection [${colName}]: Backup: ${rawDocs.length} | In Target DB: ${existingTotalInDb} | Existing (Preserved): ${alreadyExistingCount} | ${isExecute ? 'Inserted' : 'Pending Insert'}: ${toInsertDocs.length}`);
    }

    console.log('\n===========================================================');
    console.log(isExecute ? '  MIGRATION EXECUTION COMPLETED' : '  DRY RUN INSPECTION COMPLETED (ZERO WRITES PERFORMED)');
    console.log('===========================================================');
    console.table(migrationSummary);

    if (isDryRun) {
      console.log('\n[NOTICE] To execute these changes on the target database, run:');
      console.log('  node server/scripts/importDatabase.js --execute');
    }

  } catch (err) {
    console.error('\n[Error] Database operation encountered an error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Disconnected] MongoDB connection cleanly closed.');
  }
}

runSafeMigration();
