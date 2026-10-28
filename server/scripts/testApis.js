/**
 * MedVault Master API & Experiment Test Suite
 * Automatically self-starting:
 * - If server is already running on port 5000, connects and runs tests.
 * - If server is not running (e.g. in GitHub Actions CI), automatically launches
 *   server.js, waits for health check, executes all test suites, and shuts down cleanly.
 *
 * Validates:
 *  - Experiment 4: Mongoose Models & CRUD operations (7 tests)
 *  - Experiment 5: Secure REST APIs & Security Headers
 *  - Experiment 6: Authentication & Role-Based Access Control (13 tests)
 *  - Experiment 7: Postman API Collection Validation (17 tests)
 *  - Experiment 8: Real-Time Bidirectional WebSockets Messaging (10 tests)
 */

import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.dirname(__dirname);

const suites = [
  { name: 'Exp 4: Mongoose Models & CRUD Operations', script: 'testExp4Mongoose.js' },
  { name: 'Exp 6: JWT Authentication & RBAC Access Control', script: 'testAuth.js' },
  { name: 'Exp 7: Postman Automated API Collection Validation', script: 'testPostmanRunner.js' },
  { name: 'Exp 8: Real-Time Bidirectional WebSockets Suite', script: 'testRealtimeMessagingSuite.js' },
  { name: 'Regression: Authentication & Doctor Persona Isolation', script: 'testLoginBugsRegression.js' },
];

function checkHealth(port = 5000) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runScript(name, scriptFile) {
  return new Promise((resolve) => {
    console.log(`\n>>> Running: ${name} (${scriptFile})...`);
    const fullPath = path.join(__dirname, scriptFile);
    const child = spawn(process.execPath, [fullPath], {
      cwd: serverRoot,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`[PASS] ${name} completed successfully.`);
        resolve({ name, passed: true, code });
      } else {
        console.error(`[FAIL] ${name} exited with error code ${code}.`);
        resolve({ name, passed: false, code });
      }
    });

    child.on('error', (err) => {
      console.error(`[ERROR] ${name} failed to launch: ${err.message}`);
      resolve({ name, passed: false, error: err.message });
    });
  });
}

async function main() {
  console.log('======================================================');
  console.log('  MEDVAULT MASTER EXPERIMENT TEST RUNNER');
  console.log('======================================================');

  let serverProcess = null;
  const isHealthy = await checkHealth(5000);

  if (isHealthy) {
    console.log('[INFO] Backend server already running and healthy on port 5000.');
  } else {
    console.log('[INFO] Backend server not detected on port 5000. Launching server process for test run...');
    serverProcess = spawn(process.execPath, [path.join(serverRoot, 'server.js')], {
      cwd: serverRoot,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: '5000',
        NODE_ENV: process.env.NODE_ENV || 'test',
      },
    });

    serverProcess.stdout.on('data', (d) => {
      const line = d.toString();
      if (line.includes('API & WEBSOCKET ENGINE') || line.includes('Database Connected')) {
        process.stdout.write(line);
      }
    });

    serverProcess.stderr.on('data', (d) => {
      process.stderr.write(d.toString());
    });

    let ready = false;
    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      if (await checkHealth(5000)) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      console.error('[ERROR] Failed to start backend server within 30 seconds.');
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
    console.log('[INFO] Backend server successfully booted and verified on port 5000.');
  }

  const results = [];
  try {
    for (const suite of suites) {
      const res = await runScript(suite.name, suite.script);
      results.push(res);
    }
  } finally {
    if (serverProcess) {
      console.log('\n[INFO] Shutting down temporary backend test server...');
      serverProcess.kill('SIGINT');
      await sleep(1000);
    }
  }

  console.log('\n======================================================');
  console.log('  MEDVAULT MASTER TEST RESULTS SUMMARY');
  console.log('======================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? '✓ PASSED' : '✗ FAILED';
    console.log(`  ${status.padEnd(10)} | ${r.name}`);
    if (!r.passed) allPassed = false;
  }
  console.log('======================================================');

  if (allPassed) {
    console.log('\n[SUCCESS] All MedVault experiment test suites passed successfully!\n');
    process.exit(0);
  } else {
    console.error('\n[FAILURE] One or more test suites failed. Check logs above.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
