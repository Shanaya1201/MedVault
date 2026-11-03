import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

let passed = 0;
let failed = 0;

function assert(condition, name, details = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
    failed++;
  }
}

function runDockerAudit() {
  console.log('===========================================================');
  console.log('  EXPERIMENT 10: DOCKER & DEVOPS CONFIGURATION AUDIT');
  console.log('===========================================================\n');

  // 1. Docker Compose
  console.log('[Phase 1] Docker Compose File Validation');
  const composePath = path.join(rootDir, 'docker-compose.yml');
  assert(fs.existsSync(composePath), 'docker-compose.yml exists in project root');
  const composeContent = fs.readFileSync(composePath, 'utf8');
  assert(composeContent.includes('services:'), 'Defines root services block');
  assert(composeContent.includes('backend:'), 'Configures backend service container');
  assert(composeContent.includes('frontend:'), 'Configures frontend service container');
  assert(composeContent.includes('medvault-network:'), 'Configures isolated bridge network');
  assert(composeContent.includes('local-mongo'), 'Isolates local MongoDB behind "local-mongo" profile to protect Atlas');
  assert(composeContent.includes('healthcheck:'), 'Configures Docker container health checks');

  // 2. Server Dockerfile & .dockerignore
  console.log('\n[Phase 2] Backend Dockerfile & Context Validation');
  const serverDockerPath = path.join(rootDir, 'server/Dockerfile');
  assert(fs.existsSync(serverDockerPath), 'server/Dockerfile exists');
  const serverDocker = fs.readFileSync(serverDockerPath, 'utf8');
  assert(serverDocker.includes('FROM node:20-alpine AS dependencies'), 'Uses Node 20 alpine multi-stage dependencies build');
  assert(serverDocker.includes('FROM node:20-alpine AS runner'), 'Uses Node 20 alpine runner stage');
  assert(serverDocker.includes('adduser --system --uid 1001 medvault'), 'Creates secure non-root user medvault');
  assert(serverDocker.includes('USER medvault'), 'Enforces least-privilege non-root execution');
  assert(serverDocker.includes('HEALTHCHECK'), 'Includes native Docker health check');
  assert(serverDocker.includes('EXPOSE 5000'), 'Exposes port 5000');

  const serverIgnorePath = path.join(rootDir, 'server/.dockerignore');
  assert(fs.existsSync(serverIgnorePath), 'server/.dockerignore exists');
  const serverIgnore = fs.readFileSync(serverIgnorePath, 'utf8');
  assert(serverIgnore.includes('node_modules'), 'Excludes node_modules from build context');
  assert(serverIgnore.includes('.env'), 'Excludes secret .env files from build context');
  assert(serverIgnore.includes('data/backup'), 'Excludes sensitive database backup files');

  // 3. Client Dockerfile & Nginx Config
  console.log('\n[Phase 3] Frontend Dockerfile & Nginx SPA Validation');
  const clientDockerPath = path.join(rootDir, 'client/Dockerfile');
  assert(fs.existsSync(clientDockerPath), 'client/Dockerfile exists');
  const clientDocker = fs.readFileSync(clientDockerPath, 'utf8');
  assert(clientDocker.includes('FROM node:20-alpine AS builder'), 'Uses Node 20 alpine builder stage');
  assert(clientDocker.includes('FROM nginx:alpine AS runner'), 'Uses lightweight Nginx alpine production image');
  assert(clientDocker.includes('EXPOSE 80'), 'Exposes port 80');

  const nginxPath = path.join(rootDir, 'client/nginx.conf');
  assert(fs.existsSync(nginxPath), 'client/nginx.conf exists');
  const nginxContent = fs.readFileSync(nginxPath, 'utf8');
  assert(nginxContent.includes('try_files $uri $uri/ /index.html;'), 'Configures Single-Page Application (SPA) routing fallback');
  assert(nginxContent.includes('location /healthz'), 'Configures Nginx health check endpoint');

  const clientIgnorePath = path.join(rootDir, 'client/.dockerignore');
  assert(fs.existsSync(clientIgnorePath), 'client/.dockerignore exists');

  // 4. Docker Environment Template
  console.log('\n[Phase 4] Docker Environment Template');
  const envExamplePath = path.join(rootDir, 'docker-compose.env.example');
  assert(fs.existsSync(envExamplePath), 'docker-compose.env.example exists');
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  assert(!envExample.includes('SG.'), 'No real SendGrid or SMTP credentials leaked');
  assert(!envExample.includes('EAAB'), 'No real WhatsApp tokens leaked');

  console.log('\n===========================================================');
  console.log(`  EXPERIMENT 10 AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runDockerAudit();

