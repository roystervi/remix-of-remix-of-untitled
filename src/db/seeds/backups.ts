import { db } from '@/db';
import { backups } from '@/db/schema';

async function main() {
    // This seeder intentionally creates no records for the backups table.
    // The backups table tracks backup timestamps and should start empty
    // to represent a fresh system state. Backup records will be created
    // by the API endpoints when backups are actually created or imported.
    
    console.log('✅ Backups seeder completed successfully (no records inserted - table remains empty)');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});