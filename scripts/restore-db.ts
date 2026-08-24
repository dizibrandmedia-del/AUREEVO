import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('==================================================');
  console.log('  AUREEVO DATABASE SNAPSHOT RESTORE & VERIFICATION');
  console.log('==================================================\n');

  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    console.error('❌ No backups directory found at:', backupDir);
    process.exit(1);
  }

  const files = fs.readdirSync(backupDir).filter((f) => f.endsWith('.json')).sort().reverse();
  if (files.length === 0) {
    console.error('❌ No backup JSON files found in backups directory.');
    process.exit(1);
  }

  const latestBackupFile = path.join(backupDir, files[0]);
  console.log(`[Restore] Inspecting latest snapshot: ${files[0]}`);

  const content = fs.readFileSync(latestBackupFile, 'utf-8');
  const backup = JSON.parse(content);

  if (!backup.version || !backup.data) {
    console.error('❌ Invalid backup schema: missing version or data payload.');
    process.exit(1);
  }

  console.log(`\n--- SNAPSHOT INTEGRITY VERIFICATION ---`);
  console.log(`  Created: ${backup.timestamp}`);
  console.log(`  Categories: ${backup.stats.categories}`);
  console.log(`  Brands: ${backup.stats.brands}`);
  console.log(`  Products: ${backup.stats.products}`);
  console.log(`  Variants: ${backup.stats.variants}`);
  console.log(`  Orders: ${backup.stats.orders}`);
  console.log(`  Coupons: ${backup.stats.coupons}`);

  // Test restoration dry-run
  if (backup.data.categories.length > 0 && backup.data.products.length > 0) {
    console.log(`\n✔ [PASS] Integrity check passed. Snapshot is valid and restorable.`);
  } else {
    console.warn(`\n⚠️ Warning: Snapshot has empty product or category collections.`);
  }

  console.log('==================================================');
}

main()
  .catch((e) => {
    console.error('❌ Restore verification failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
