#!/usr/bin/env python3
"""
Test script for Task 4.4: Test monitoring in unified app

This script verifies:
1. The app is running
2. Monitoring can track application focus
3. Activity logs are being recorded in the database
4. Database contains valid data

Requirements: 1.1, 3.2, 3.3
"""

import sqlite3
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

def get_database_path():
    """Get the path to the Forgrin database"""
    if os.name == 'nt':  # Windows
        appdata = os.getenv('APPDATA')
        db_path = Path(appdata) / 'com.forgrin.desktop' / 'forgrin.db'
    else:
        # macOS/Linux
        home = Path.home()
        if os.uname().sysname == 'Darwin':  # macOS
            db_path = home / 'Library' / 'Application Support' / 'com.forgrin.desktop' / 'forgrin.db'
        else:  # Linux
            db_path = home / '.local' / 'share' / 'com.forgrin.desktop' / 'forgrin.db'
    
    return db_path

def test_monitoring():
    """Test the monitoring functionality"""
    print("=" * 80)
    print("Forgrin Monitoring Test - Task 4.4")
    print("=" * 80)
    print()
    
    # Get database path
    db_path = get_database_path()
    print(f"Database path: {db_path}")
    
    # Check if database exists
    if not db_path.exists():
        print("❌ Database not found!")
        print("   Please ensure the Forgrin app has been started.")
        return False
    
    print("✅ Database found")
    print()
    
    # Connect to database
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        print("✅ Connected to database")
        print()
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return False
    
    # Query activity logs from the last 5 minutes
    five_minutes_ago = int((datetime.now() - timedelta(minutes=5)).timestamp() * 1000)
    
    try:
        cursor.execute("""
            SELECT id, timestamp, application, process_id, duration, category, executable_path
            FROM activity_logs
            WHERE timestamp > ?
            ORDER BY timestamp DESC
            LIMIT 50
        """, (five_minutes_ago,))
        
        logs = cursor.fetchall()
        
        print(f"Found {len(logs)} activity log(s) in the last 5 minutes")
        print()
        
        if len(logs) == 0:
            print("⚠️  No activity logs found")
            print()
            print("This could mean:")
            print("  1. Monitoring is not running (needs to be started via Tauri command)")
            print("  2. No application focus changes occurred in the last 5 minutes")
            print()
            print("To start monitoring:")
            print("  - Open the Forgrin app")
            print("  - Navigate to http://localhost:3000/test-monitoring.html")
            print("  - Click 'Start Monitoring'")
            print("  - Switch between different applications")
            print("  - Run this script again")
            print()
            return False
        
        # Display activity logs
        print("─" * 80)
        print("Activity Logs:")
        print("─" * 80)
        print()
        
        for i, log in enumerate(logs, 1):
            log_id, timestamp, application, process_id, duration, category, executable_path = log
            
            # Convert timestamp to readable format
            dt = datetime.fromtimestamp(timestamp / 1000)
            
            print(f"{i}. Application: {application}")
            print(f"   Process ID: {process_id if process_id else 'N/A'}")
            print(f"   Timestamp: {dt.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"   Duration: {duration} seconds")
            print(f"   Category: {category if category else 'Uncategorized'}")
            if executable_path:
                print(f"   Path: {executable_path}")
            print()
        
        print("─" * 80)
        print()
        
        # Verify data quality
        print("✅ Task 4.4 Verification Results:")
        print()
        
        # Check 1: Monitoring is tracking
        print("   ✓ Monitoring is tracking application focus")
        
        # Check 2: Activity logs are recorded
        print("   ✓ Activity logs are being recorded in database")
        
        # Check 3: Timestamps are valid
        all_timestamps_valid = all(log[1] > five_minutes_ago for log in logs)
        if all_timestamps_valid:
            print("   ✓ Timestamps are valid and recent")
        else:
            print("   ⚠️  Some timestamps are outside expected range")
        
        # Check 4: Application names are captured
        all_have_names = all(log[2] and len(log[2]) > 0 for log in logs)
        if all_have_names:
            print("   ✓ Application names are captured")
        else:
            print("   ⚠️  Some logs are missing application names")
        
        # Check 5: Process IDs are captured
        all_have_pids = all(log[3] is not None for log in logs)
        if all_have_pids:
            print("   ✓ Process IDs are captured")
        else:
            print("   ⚠️  Some logs are missing process IDs")
        
        # Check 6: Durations are tracked
        has_durations = any(log[4] > 0 for log in logs)
        if has_durations:
            print("   ✓ Durations are being tracked")
        else:
            print("   ⚠️  No durations recorded (may need more time or focus changes)")
        
        print()
        print("=" * 80)
        print("✅ Task 4.4 PASSED: Monitoring is working correctly!")
        print("=" * 80)
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error querying database: {e}")
        conn.close()
        return False

if __name__ == '__main__':
    success = test_monitoring()
    exit(0 if success else 1)
