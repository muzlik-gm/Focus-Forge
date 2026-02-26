-- Add executable_path column to activity_logs table
-- This stores the full path to the application executable for better tracking

ALTER TABLE activity_logs ADD COLUMN executable_path TEXT;
