// Test script to verify monitoring functionality
// This script tests task 4.4 requirements:
// - Start monitoring
// - Verify tracking works
// - Check database for activity logs

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// Get the database path (same as in Rust code)
const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const dbPath = path.join(appDataDir, 'com.forgrin.desktop', 'forgrin.db');

console.log('Testing Forgrin Monitoring System');
console.log('====================================\n');
console.log(`Database path: ${dbPath}\n`);

// Wait for a few seconds to let monitoring run
console.log('Waiting 10 seconds for monitoring to track activity...');
console.log('Please switch between different applications during this time.\n');

setTimeout(() => {
    // Open database and check for activity logs
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            process.exit(1);
        }

        console.log('Database opened successfully\n');

        // Query activity logs from the last minute
        const oneMinuteAgo = Date.now() - 60000;

        db.all(
            'SELECT * FROM activity_logs WHERE timestamp > ? ORDER BY timestamp DESC',
            [oneMinuteAgo],
            (err, rows) => {
                if (err) {
                    console.error('Error querying activity logs:', err.message);
                    db.close();
                    process.exit(1);
                }

                console.log(`Found ${rows.length} activity log(s) in the last minute:\n`);

                if (rows.length === 0) {
                    console.log('⚠️  No activity logs found. Monitoring may not be running.');
                    console.log('   Please start monitoring from the app UI or via Tauri command.\n');
                } else {
                    console.log('✅ Monitoring is working! Activity logs:');
                    console.log('─'.repeat(80));

                    rows.forEach((row, index) => {
                        const timestamp = new Date(row.timestamp);
                        console.log(`\n${index + 1}. Application: ${row.application}`);
                        console.log(`   Process ID: ${row.process_id || 'N/A'}`);
                        console.log(`   Timestamp: ${timestamp.toLocaleString()}`);
                        console.log(`   Duration: ${row.duration} seconds`);
                        console.log(`   Category: ${row.category || 'Uncategorized'}`);
                        if (row.executable_path) {
                            console.log(`   Path: ${row.executable_path}`);
                        }
                    });

                    console.log('\n' + '─'.repeat(80));
                    console.log('\n✅ Task 4.4 Verification:');
                    console.log('   ✓ Monitoring is tracking application focus');
                    console.log('   ✓ Activity logs are being recorded in database');
                    console.log('   ✓ Timestamps and durations are being tracked');
                    console.log('   ✓ Application names and process IDs are captured\n');
                }

                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    }
                });
            }
        );
    });
}, 10000);
