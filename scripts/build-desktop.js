#!/usr/bin/env node

/**
 * Desktop Build Script
 * 
 * This script prepares the Next.js app for desktop build by:
 * 1. Temporarily renaming the app/api directory (not needed in desktop)
 * 2. Running Next.js build with static export
 * 3. Restoring the app/api directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_DIR = path.join(__dirname, '..', 'app', 'api');
const API_BACKUP = path.join(__dirname, '..', '.api-backup-temp');
const ONBOARDING_DIR = path.join(__dirname, '..', 'app', 'onboarding');
const ONBOARDING_BACKUP = path.join(__dirname, '..', '.onboarding-backup-temp');

console.log('🔧 Preparing desktop build...\n');

// Step 1: Backup API directory
if (fs.existsSync(API_DIR)) {
  console.log('📦 Backing up API routes...');
  if (fs.existsSync(API_BACKUP)) {
    fs.rmSync(API_BACKUP, { recursive: true, force: true });
  }
  // Use copy instead of rename to avoid OneDrive sync issues
  fs.cpSync(API_DIR, API_BACKUP, { recursive: true });
  fs.rmSync(API_DIR, { recursive: true, force: true });
  console.log('✅ API routes backed up\n');
}

// Step 2: Backup onboarding directory (uses server-side features)
if (fs.existsSync(ONBOARDING_DIR)) {
  console.log('📦 Backing up onboarding page...');
  if (fs.existsSync(ONBOARDING_BACKUP)) {
    fs.rmSync(ONBOARDING_BACKUP, { recursive: true, force: true });
  }
  // Use copy instead of rename to avoid OneDrive sync issues
  fs.cpSync(ONBOARDING_DIR, ONBOARDING_BACKUP, { recursive: true });
  fs.rmSync(ONBOARDING_DIR, { recursive: true, force: true });
  console.log('✅ Onboarding page backed up\n');
}

try {
  // Step 2: Run Next.js build
  console.log('🏗️  Building Next.js for desktop...\n');
  execSync('next build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('\n✅ Next.js build complete\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exitCode = 1;
} finally {
  // Step 3: Restore API directory
  if (fs.existsSync(API_BACKUP)) {
    console.log('📦 Restoring API routes...');
    if (fs.existsSync(API_DIR)) {
      fs.rmSync(API_DIR, { recursive: true, force: true });
    }
    // Use copy instead of rename to avoid OneDrive sync issues
    fs.cpSync(API_BACKUP, API_DIR, { recursive: true });
    fs.rmSync(API_BACKUP, { recursive: true, force: true });
    console.log('✅ API routes restored\n');
  }
  
  // Step 4: Restore onboarding directory
  if (fs.existsSync(ONBOARDING_BACKUP)) {
    console.log('📦 Restoring onboarding page...');
    if (fs.existsSync(ONBOARDING_DIR)) {
      fs.rmSync(ONBOARDING_DIR, { recursive: true, force: true });
    }
    // Use copy instead of rename to avoid OneDrive sync issues
    fs.cpSync(ONBOARDING_BACKUP, ONBOARDING_DIR, { recursive: true });
    fs.rmSync(ONBOARDING_BACKUP, { recursive: true, force: true });
    console.log('✅ Onboarding page restored\n');
  }
}

if (process.exitCode === 0 || !process.exitCode) {
  console.log('✅ Desktop build preparation complete!');
} else {
  console.log('❌ Desktop build preparation failed!');
}
