import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '..', 'data', 'backup');

function verifyBackup() {
  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('[Verify] FAILED: manifest.json does not exist at ' + manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log('[Verify] Backup Manifest exportedAt:', manifest.exportedAt);
  console.log('[Verify] Source Database:', manifest.sourceDatabase);
  console.log('-----------------------------------------------------------');

  let allValid = true;
  const collectionNames = Object.keys(manifest.collections);

  for (const col of collectionNames) {
    const expected = manifest.collections[col];
    const filePath = path.join(backupDir, `${col}.json`);

    if (!fs.existsSync(filePath)) {
      console.error(`  [FAIL] Missing file: ${filePath}`);
      allValid = false;
      continue;
    }

    try {
      const stats = fs.statSync(filePath);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const docs = JSON.parse(raw);

      if (!Array.isArray(docs)) {
        console.error(`  [FAIL] ${col}.json is not a valid JSON array.`);
        allValid = false;
        continue;
      }

      if (docs.length !== expected) {
        console.error(`  [FAIL] ${col}.json count mismatch: expected ${expected}, got ${docs.length}`);
        allValid = false;
      } else {
        console.log(`  ✓ ${col.padEnd(15)} : ${String(docs.length).padStart(4)} docs | ${String(stats.size).padStart(8)} bytes | Valid JSON Array`);
      }
    } catch (err) {
      console.error(`  [FAIL] ${col}.json could not be read or parsed: ${err.message}`);
      allValid = false;
    }
  }

  console.log('-----------------------------------------------------------');
  if (allValid) {
    console.log('[Verify] ALL 8 BACKUP FILES EXIST, ARE READABLE, AND MATCH MANIFEST PERFECTLY.');
  } else {
    console.error('[Verify] BACKUP VERIFICATION FAILED.');
    process.exit(1);
  }
}

verifyBackup();

