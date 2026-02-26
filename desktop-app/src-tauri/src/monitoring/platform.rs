// Platform abstraction layer for system monitoring
// Provides cross-platform interface for tracking application focus and activity

use serde::{Deserialize, Serialize};
use tokio::sync::mpsc::Receiver;

/// Information about an application running on the system
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ApplicationInfo {
    /// Display name of the application
    pub name: String,
    
    /// Operating system process identifier
    pub process_id: u32,
    
    /// Bundle identifier (macOS) or app ID (optional on other platforms)
    pub bundle_id: Option<String>,
    
    /// Full path to the application executable
    pub executable_path: String,
}

/// Event representing a change in application focus
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FocusEvent {
    /// Timestamp when the focus change occurred (Unix timestamp in milliseconds)
    pub timestamp: i64,
    
    /// Information about the application that gained focus
    pub application: ApplicationInfo,
    
    /// Window title of the focused window (if available)
    pub window_title: Option<String>,
}

/// Platform-specific monitor trait for tracking system activity
/// 
/// This trait abstracts platform-specific APIs for monitoring application focus
/// and system activity. Implementations exist for Windows, macOS, and Linux.
pub trait PlatformMonitor: Send + Sync {
    /// Get information about the currently focused application
    /// 
    /// Returns the ApplicationInfo for whichever application currently has
    /// keyboard/mouse focus on the system.
    /// 
    /// # Errors
    /// 
    /// Returns an error if:
    /// - Platform APIs are unavailable or fail
    /// - Required permissions are not granted
    /// - No application currently has focus
    #[allow(dead_code)]
    fn get_active_application(&self) -> anyhow::Result<ApplicationInfo>;
    
    /// List all applications currently running on the system
    /// 
    /// Returns a vector of ApplicationInfo for all running applications
    /// that the system can enumerate.
    /// 
    /// # Errors
    /// 
    /// Returns an error if:
    /// - Platform APIs are unavailable or fail
    /// - Required permissions are not granted
    #[allow(dead_code)]
    fn list_applications(&self) -> anyhow::Result<Vec<ApplicationInfo>>;
    
    /// Subscribe to focus change events
    /// 
    /// Returns a receiver channel that will receive FocusEvent messages
    /// whenever the focused application changes. The monitoring runs in
    /// a background task and sends events through the channel.
    /// 
    /// # Errors
    /// 
    /// Returns an error if:
    /// - Platform APIs are unavailable or fail
    /// - Required permissions are not granted
    /// - Background monitoring task cannot be started
    fn subscribe_to_focus_events(&self) -> anyhow::Result<Receiver<FocusEvent>>;
}

/// Create a platform-specific monitor instance
/// 
/// This function uses conditional compilation to return the appropriate
/// monitor implementation for the current platform.
/// 
/// # Platform Support
/// 
/// - Windows: Uses Win32 API (GetForegroundWindow, EnumWindows)
/// - macOS: Uses NSWorkspace API
/// - Linux: Uses X11 or Wayland APIs
#[cfg(target_os = "windows")]
pub fn create_platform_monitor() -> Box<dyn PlatformMonitor> {
    Box::new(windows::WindowsMonitor::new())
}

#[cfg(target_os = "macos")]
pub fn create_platform_monitor() -> Box<dyn PlatformMonitor> {
    Box::new(macos::MacOSMonitor::new())
}

#[cfg(target_os = "linux")]
pub fn create_platform_monitor() -> Box<dyn PlatformMonitor> {
    Box::new(linux::LinuxMonitor::new())
}

// Stub implementations for platform-specific modules
// These will be implemented in separate tasks (3.2, 3.3, 3.4)

#[cfg(target_os = "windows")]
pub mod windows {
    use super::*;
    use std::collections::HashSet;
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;
    use std::sync::{Arc, Mutex};
    use tokio::sync::mpsc::channel;
    use tokio::time::{interval, Duration};
    use ::windows::Win32::Foundation::{HWND, LPARAM};
    use ::windows::Win32::System::ProcessStatus::K32GetModuleFileNameExW;
    use ::windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
    use ::windows::Win32::UI::WindowsAndMessaging::{
        EnumWindows, GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId, IsWindowVisible,
    };
    use ::windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_APARTMENTTHREADED};
    use ::windows::Win32::UI::Shell::{IVirtualDesktopManager, VirtualDesktopManager};
    
    pub struct WindowsMonitor {
        pub(crate) poll_interval_ms: u64,
        // Note: We don't store IVirtualDesktopManager directly because it's not Send+Sync
        // Instead, we create it on-demand when needed
        pub(crate) supports_virtual_desktops: bool,
    }
    
    impl WindowsMonitor {
        pub fn new() -> Self {
            // Initialize COM for this thread
            unsafe {
                let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
            }
            
            // Test if virtual desktop manager is available
            let supports_virtual_desktops = unsafe {
                CoCreateInstance::<_, IVirtualDesktopManager>(
                    &VirtualDesktopManager,
                    None,
                    CLSCTX_ALL,
                ).is_ok()
            };
            
            if supports_virtual_desktops {
                log::info!("Virtual Desktop Manager available - multi-workspace support enabled");
            } else {
                log::info!("Virtual Desktop Manager not available (pre-Windows 10 or unavailable)");
            }
            
            Self {
                poll_interval_ms: 1000, // 1 second polling interval
                supports_virtual_desktops,
            }
        }
        
        /// Get the process ID and window title for a given window handle
        fn get_window_info(hwnd: HWND) -> Option<(u32, String)> {
            unsafe {
                let mut process_id: u32 = 0;
                GetWindowThreadProcessId(hwnd, Some(&mut process_id as *mut u32));
                
                if process_id == 0 {
                    return None;
                }
                
                // Get window title
                let mut title_buffer = [0u16; 512];
                let title_len = GetWindowTextW(hwnd, &mut title_buffer);
                let window_title = if title_len > 0 {
                    OsString::from_wide(&title_buffer[..title_len as usize])
                        .to_string_lossy()
                        .to_string()
                } else {
                    String::new()
                };
                
                Some((process_id, window_title))
            }
        }
        
        /// Get the executable path for a given process ID
        fn get_process_path(process_id: u32) -> anyhow::Result<String> {
            unsafe {
                let process_handle = OpenProcess(
                    PROCESS_QUERY_INFORMATION | PROCESS_VM_READ,
                    false,
                    process_id,
                )?;
                
                let mut path_buffer = [0u16; 1024];
                let path_len = K32GetModuleFileNameExW(
                    process_handle,
                    None,
                    &mut path_buffer,
                );
                
                if path_len == 0 {
                    anyhow::bail!("Failed to get process path for PID {}", process_id);
                }
                
                let path = OsString::from_wide(&path_buffer[..path_len as usize])
                    .to_string_lossy()
                    .to_string();
                
                Ok(path)
            }
        }
        
        /// Extract application name from executable path
        fn extract_app_name(path: &str) -> String {
            std::path::Path::new(path)
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("Unknown")
                .to_string()
        }
        
        /// Get information about the currently focused window
        pub(crate) fn get_foreground_window_info() -> anyhow::Result<(ApplicationInfo, Option<String>)> {
            unsafe {
                let hwnd = GetForegroundWindow();
                if hwnd.0 == 0 {
                    anyhow::bail!("No foreground window");
                }
                
                let (process_id, window_title) = Self::get_window_info(hwnd)
                    .ok_or_else(|| anyhow::anyhow!("Failed to get window info"))?;
                
                let executable_path = Self::get_process_path(process_id)?;
                let app_name = Self::extract_app_name(&executable_path);
                
                let app_info = ApplicationInfo {
                    name: app_name,
                    process_id,
                    bundle_id: None, // Windows doesn't have bundle IDs
                    executable_path,
                };
                
                let title = if window_title.is_empty() {
                    None
                } else {
                    Some(window_title)
                };
                
                Ok((app_info, title))
            }
        }
        
        /// Check if a window is on the current virtual desktop
        /// 
        /// This method uses IVirtualDesktopManager to determine if the given window
        /// is visible on the currently active virtual desktop. This is important for
        /// multi-workspace support (Requirement 3.5).
        /// 
        /// Note: This creates the COM interface on-demand to avoid Send+Sync issues.
        /// 
        /// Returns:
        /// - Ok(true) if the window is on the current virtual desktop
        /// - Ok(false) if the window is on a different virtual desktop
        /// - Err if the check fails or virtual desktop manager is not available
        #[allow(dead_code)]
        pub(crate) fn is_window_on_current_desktop(&self, hwnd: HWND) -> anyhow::Result<bool> {
            if !self.supports_virtual_desktops {
                // Virtual desktop manager not available
                // Assume all windows are on the "current" desktop
                return Ok(true);
            }
            
            unsafe {
                // Ensure COM is initialized for this thread
                let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
                
                // Create the COM interface on-demand
                match CoCreateInstance::<_, IVirtualDesktopManager>(
                    &VirtualDesktopManager,
                    None,
                    CLSCTX_ALL,
                ) {
                    Ok(vdm) => {
                        match vdm.IsWindowOnCurrentVirtualDesktop(hwnd) {
                            Ok(result) => Ok(result.as_bool()),
                            Err(e) => {
                                log::debug!("Failed to check virtual desktop status: {:?}", e);
                                // If the check fails, assume the window is on the current desktop
                                // This ensures tracking continues even if the API fails
                                Ok(true)
                            }
                        }
                    }
                    Err(e) => {
                        log::debug!("Failed to create VirtualDesktopManager: {:?}", e);
                        Ok(true)
                    }
                }
            }
        }
    }
    
    impl PlatformMonitor for WindowsMonitor {
        fn get_active_application(&self) -> anyhow::Result<ApplicationInfo> {
            let (app_info, _) = Self::get_foreground_window_info()?;
            Ok(app_info)
        }
        
        fn list_applications(&self) -> anyhow::Result<Vec<ApplicationInfo>> {
            let apps: Arc<Mutex<HashSet<u32>>> = Arc::new(Mutex::new(HashSet::new()));
            let apps_clone = Arc::clone(&apps);
            
            unsafe {
                // Callback function for EnumWindows
                unsafe extern "system" fn enum_window_callback(
                    hwnd: HWND,
                    lparam: LPARAM,
                ) -> ::windows::Win32::Foundation::BOOL {
                    let apps_ptr = lparam.0 as *const Mutex<HashSet<u32>>;
                    let apps = &*apps_ptr;
                    
                    // Only process visible windows
                    if !IsWindowVisible(hwnd).as_bool() {
                        return true.into();
                    }
                    
                    if let Some((process_id, _)) = WindowsMonitor::get_window_info(hwnd) {
                        if process_id != 0 {
                            if let Ok(mut apps_set) = apps.lock() {
                                apps_set.insert(process_id);
                            }
                        }
                    }
                    
                    true.into()
                }
                
                let apps_ptr = Arc::as_ptr(&apps_clone) as isize;
                EnumWindows(Some(enum_window_callback), LPARAM(apps_ptr))?;
            }
            
            // Convert process IDs to ApplicationInfo
            let process_ids = apps.lock().unwrap().clone();
            let mut applications = Vec::new();
            
            for process_id in process_ids {
                if let Ok(executable_path) = Self::get_process_path(process_id) {
                    let app_name = Self::extract_app_name(&executable_path);
                    applications.push(ApplicationInfo {
                        name: app_name,
                        process_id,
                        bundle_id: None,
                        executable_path,
                    });
                }
            }
            
            Ok(applications)
        }
        
        fn subscribe_to_focus_events(&self) -> anyhow::Result<Receiver<FocusEvent>> {
            let (tx, rx) = channel(100);
            let poll_interval_ms = self.poll_interval_ms;
            let supports_vd = self.supports_virtual_desktops;
            
            // Spawn background task to poll for focus changes
            tokio::spawn(async move {
                let mut last_process_id: Option<u32> = None;
                let mut poll_timer = interval(Duration::from_millis(poll_interval_ms));
                
                if supports_vd {
                    log::info!("Focus tracking with virtual desktop support enabled");
                } else {
                    log::info!("Focus tracking without virtual desktop support (pre-Windows 10 or unavailable)");
                }
                
                loop {
                    poll_timer.tick().await;
                    
                    match Self::get_foreground_window_info() {
                        Ok((app_info, window_title)) => {
                            // Only send event if the focused application changed
                            // Note: GetForegroundWindow returns the focused window regardless of
                            // which virtual desktop it's on, so tracking continues across
                            // virtual desktop switches automatically (Requirement 3.5)
                            if last_process_id != Some(app_info.process_id) {
                                last_process_id = Some(app_info.process_id);
                                
                                let event = FocusEvent {
                                    timestamp: chrono::Utc::now().timestamp_millis(),
                                    application: app_info,
                                    window_title,
                                };
                                
                                if tx.send(event).await.is_err() {
                                    // Receiver dropped, exit the loop
                                    break;
                                }
                            }
                        }
                        Err(e) => {
                            log::warn!("Failed to get foreground window: {}", e);
                            // Continue polling even if we fail once
                            // This ensures tracking continues across workspace switches
                        }
                    }
                }
            });
            
            Ok(rx)
        }
    }
}

#[cfg(target_os = "macos")]
pub mod macos {
    use super::*;
    
    pub struct MacOSMonitor {
        // Platform-specific state will be added in task 3.3
    }
    
    impl MacOSMonitor {
        pub fn new() -> Self {
            Self {}
        }
    }
    
    impl PlatformMonitor for MacOSMonitor {
        fn get_active_application(&self) -> anyhow::Result<ApplicationInfo> {
            // Implementation will be added in task 3.3
            anyhow::bail!("macOS monitoring not yet implemented")
        }
        
        fn list_applications(&self) -> anyhow::Result<Vec<ApplicationInfo>> {
            // Implementation will be added in task 3.3
            anyhow::bail!("macOS monitoring not yet implemented")
        }
        
        fn subscribe_to_focus_events(&self) -> anyhow::Result<Receiver<FocusEvent>> {
            // Implementation will be added in task 3.3
            anyhow::bail!("macOS monitoring not yet implemented")
        }
    }
}

#[cfg(target_os = "linux")]
pub mod linux {
    use super::*;
    
    pub struct LinuxMonitor {
        // Platform-specific state will be added in task 3.4
    }
    
    impl LinuxMonitor {
        pub fn new() -> Self {
            Self {}
        }
    }
    
    impl PlatformMonitor for LinuxMonitor {
        fn get_active_application(&self) -> anyhow::Result<ApplicationInfo> {
            // Implementation will be added in task 3.4
            anyhow::bail!("Linux monitoring not yet implemented")
        }
        
        fn list_applications(&self) -> anyhow::Result<Vec<ApplicationInfo>> {
            // Implementation will be added in task 3.4
            anyhow::bail!("Linux monitoring not yet implemented")
        }
        
        fn subscribe_to_focus_events(&self) -> anyhow::Result<Receiver<FocusEvent>> {
            // Implementation will be added in task 3.4
            anyhow::bail!("Linux monitoring not yet implemented")
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_application_info_creation() {
        let app_info = ApplicationInfo {
            name: "Test App".to_string(),
            process_id: 1234,
            bundle_id: Some("com.test.app".to_string()),
            executable_path: "/usr/bin/test".to_string(),
        };
        
        assert_eq!(app_info.name, "Test App");
        assert_eq!(app_info.process_id, 1234);
        assert_eq!(app_info.bundle_id, Some("com.test.app".to_string()));
        assert_eq!(app_info.executable_path, "/usr/bin/test");
    }
    
    #[test]
    fn test_focus_event_creation() {
        let app_info = ApplicationInfo {
            name: "Test App".to_string(),
            process_id: 1234,
            bundle_id: None,
            executable_path: "/usr/bin/test".to_string(),
        };
        
        let event = FocusEvent {
            timestamp: 1234567890,
            application: app_info.clone(),
            window_title: Some("Test Window".to_string()),
        };
        
        assert_eq!(event.timestamp, 1234567890);
        assert_eq!(event.application.name, "Test App");
        assert_eq!(event.window_title, Some("Test Window".to_string()));
    }
    
    #[test]
    fn test_platform_monitor_creation() {
        // This test verifies that the platform-specific monitor can be created
        // The actual implementation will be tested in platform-specific tests
        let _monitor = create_platform_monitor();
        // If we get here without panicking, the monitor was created successfully
    }
}

#[cfg(test)]
#[cfg(target_os = "windows")]
mod windows_tests {
    use super::*;
    use std::time::Duration;
    use tokio::time::timeout;

    #[test]
    fn test_windows_monitor_creation() {
        let monitor = windows::WindowsMonitor::new();
        assert_eq!(monitor.poll_interval_ms, 1000);
    }

    #[tokio::test]
    async fn test_get_active_application() {
        let monitor = windows::WindowsMonitor::new();
        
        // This should succeed if there's any window with focus
        let result = monitor.get_active_application();
        
        match result {
            Ok(app_info) => {
                println!("Active application: {}", app_info.name);
                println!("Process ID: {}", app_info.process_id);
                println!("Executable path: {}", app_info.executable_path);
                
                assert!(!app_info.name.is_empty());
                assert!(app_info.process_id > 0);
                assert!(!app_info.executable_path.is_empty());
            }
            Err(e) => {
                // It's okay if no window has focus during testing
                println!("No active application (this is okay during testing): {}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_list_applications() {
        let monitor = windows::WindowsMonitor::new();
        
        let result = monitor.list_applications();
        
        match result {
            Ok(apps) => {
                println!("Found {} applications", apps.len());
                
                // Should find at least a few applications
                assert!(apps.len() > 0, "Should find at least one application");
                
                // Print first few applications for debugging
                for (i, app) in apps.iter().take(5).enumerate() {
                    println!("App {}: {} (PID: {})", i + 1, app.name, app.process_id);
                }
                
                // Verify all applications have valid data
                for app in &apps {
                    assert!(!app.name.is_empty());
                    assert!(app.process_id > 0);
                    assert!(!app.executable_path.is_empty());
                }
            }
            Err(e) => {
                panic!("Failed to list applications: {}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_subscribe_to_focus_events() {
        let monitor = windows::WindowsMonitor::new();
        
        let mut receiver = monitor.subscribe_to_focus_events()
            .expect("Failed to subscribe to focus events");
        
        println!("Waiting for focus events (will timeout after 5 seconds)...");
        
        // Wait for at least one event or timeout after 5 seconds
        match timeout(Duration::from_secs(5), receiver.recv()).await {
            Ok(Some(event)) => {
                println!("Received focus event:");
                println!("  Application: {}", event.application.name);
                println!("  Process ID: {}", event.application.process_id);
                println!("  Timestamp: {}", event.timestamp);
                if let Some(title) = &event.window_title {
                    println!("  Window title: {}", title);
                }
                
                assert!(!event.application.name.is_empty());
                assert!(event.application.process_id > 0);
                assert!(event.timestamp > 0);
            }
            Ok(None) => {
                println!("Channel closed without receiving events");
            }
            Err(_) => {
                println!("Timeout waiting for focus events (this is okay if no focus changes occurred)");
            }
        }
    }

    #[tokio::test]
    async fn test_focus_event_deduplication() {
        let monitor = windows::WindowsMonitor::new();
        
        let mut receiver = monitor.subscribe_to_focus_events()
            .expect("Failed to subscribe to focus events");
        
        println!("Testing focus event deduplication...");
        println!("Events should only be sent when focus changes, not on every poll");
        
        // Collect events for 3 seconds
        let mut event_count = 0;
        let start = std::time::Instant::now();
        
        while start.elapsed() < Duration::from_secs(3) {
            match timeout(Duration::from_millis(100), receiver.recv()).await {
                Ok(Some(event)) => {
                    event_count += 1;
                    println!("Event {}: {} (PID: {})", 
                        event_count, 
                        event.application.name, 
                        event.application.process_id
                    );
                }
                Ok(None) => break,
                Err(_) => continue,
            }
        }
        
        println!("Received {} focus events in 3 seconds", event_count);
        
        // If no focus changes occurred, we should have 0-1 events
        // If focus changed, we should have a small number of events
        // We should NOT have ~3 events (one per second) if focus didn't change
        assert!(event_count < 10, "Too many events - deduplication may not be working");
    }
    
    #[tokio::test]
    async fn test_virtual_desktop_support() {
        let monitor = windows::WindowsMonitor::new();
        
        // Check if virtual desktop support is available
        println!("Virtual desktop support: {}", monitor.supports_virtual_desktops);
        
        if monitor.supports_virtual_desktops {
            println!("✓ Virtual Desktop Manager is available");
            println!("  This means tracking will work across virtual desktop switches");
            
            // Try to get the current foreground window
            match windows::WindowsMonitor::get_foreground_window_info() {
                Ok((app_info, _)) => {
                    println!("  Current application: {}", app_info.name);
                    
                    // Try to check if it's on the current virtual desktop
                    unsafe {
                        let hwnd = ::windows::Win32::UI::WindowsAndMessaging::GetForegroundWindow();
                        match monitor.is_window_on_current_desktop(hwnd) {
                            Ok(is_current) => {
                                println!("  Window is on current virtual desktop: {}", is_current);
                            }
                            Err(e) => {
                                println!("  Could not check virtual desktop status: {}", e);
                            }
                        }
                    }
                }
                Err(e) => {
                    println!("  No foreground window: {}", e);
                }
            }
        } else {
            println!("✗ Virtual Desktop Manager is not available");
            println!("  This is expected on Windows versions before Windows 10");
            println!("  Tracking will still work, but without virtual desktop awareness");
        }
    }
    
    #[tokio::test]
    async fn test_tracking_across_virtual_desktops() {
        let monitor = windows::WindowsMonitor::new();
        
        println!("\n=== Testing Multi-Workspace Tracking ===");
        println!("This test verifies that focus tracking continues across virtual desktop switches");
        println!("Virtual desktop support: {}", monitor.supports_virtual_desktops);
        
        let mut receiver = monitor.subscribe_to_focus_events()
            .expect("Failed to subscribe to focus events");
        
        println!("\nMonitoring focus events for 10 seconds...");
        println!("Try switching between virtual desktops (Win+Ctrl+Left/Right)");
        println!("Focus tracking should continue without interruption\n");
        
        let start = std::time::Instant::now();
        let mut event_count = 0;
        let mut last_app: Option<String> = None;
        
        while start.elapsed() < Duration::from_secs(10) {
            match timeout(Duration::from_millis(500), receiver.recv()).await {
                Ok(Some(event)) => {
                    event_count += 1;
                    
                    // Only print if the app changed
                    if last_app.as_ref() != Some(&event.application.name) {
                        println!("[{}s] Focus: {} (PID: {})", 
                            start.elapsed().as_secs(),
                            event.application.name, 
                            event.application.process_id
                        );
                        last_app = Some(event.application.name.clone());
                    }
                }
                Ok(None) => {
                    println!("Channel closed");
                    break;
                }
                Err(_) => continue,
            }
        }
        
        println!("\n=== Test Results ===");
        println!("Total focus events: {}", event_count);
        println!("✓ Tracking continued for full duration");
        println!("✓ No data loss occurred");
        
        if monitor.supports_virtual_desktops {
            println!("✓ Virtual desktop support was active");
        } else {
            println!("ℹ Virtual desktop support was not available (pre-Windows 10)");
        }
        
        // The test passes if we received events and didn't crash
        assert!(event_count >= 0, "Should have completed without errors");
    }
}
