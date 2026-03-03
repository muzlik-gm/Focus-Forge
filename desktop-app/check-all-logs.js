// Check if there are ANY activity logs in the database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

const appDataDir = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const dbPath = path.join(appDataDir, 'com.forgrin.desktop', 'forgrin.db');

console.log('Checking database:', dbPath);
console.log('');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }

    // Count total logs
    db.get('SELECT COUNT(*) as count FROM activity_logs', (err, row) => {
        if (err) {
            console.error('Error counting logs:', err.message);
            db.close();
            process.exit(1);
        }

        console.log(`Total activity logs in database: ${row.count}`);
        console.log('');

        if (row.count === 0) {
            console.log('❌ No activity logs found at all!');
            console.log('');
            console.log('This means monitoring is not recording any data.');
            console.log('Possible issues:');
            console.log('  1. Monitoring task is not running properly');
            console.log('  2. Focus events are not being generated');
            console.log('  3. Database writes are failing');
            console.log('');
            console.log('Check the app logs for errors.');
        } else {
            // Show the most recent logs
            db.all('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 10', (err, rows) => {
                if (err) {
                    console.error('Error fetching logs:', err.message);
                } else {
                    console.log('Most recent activity logs:');
                    console.log('─'.repeat(80));
                    rows.forEach((row, index) => {
                        const timestamp = new Date(row.timestamp);
                        console.log(`\n${index + 1}. ${row.application}`);
                        console.log(`   PID: ${row.process_id || 'N/A'}`);
                        console.log(`   Time: ${timestamp.toLocaleString()}`);
                        console.log(`   Duration: ${row.duration}s`);
                        if (row.executable_path) {
                            console.log(`   Path: ${row.executable_path}`);
                        }
                    });
                    console.log('\n' + '─'.repeat(80));
                    console.log('\n✅ Monitoring is working!');
                }
                db.close();
            });
        }
    });
});
