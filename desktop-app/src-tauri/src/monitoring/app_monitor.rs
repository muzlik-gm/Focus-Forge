// Application monitoring implementation
// Platform-specific code for tracking active applications

use super::{ActivityMonitor, ApplicationActivity, ActivityCategory};
use anyhow::Result;
use chrono::Utc;
use std::sync::{Arc, Mutex};
use std::time::Duration;

pub struct AppMonitor {
    is_running: Arc<Mutex<bool>>,
    current_activity: Arc<Mutex<Option<ApplicationActivity>>>,
    poll_interval: Duration,
}

impl AppMonitor {
    pub fn new(poll_interval_ms: u64) -> Self {
        Self {
            is_running: Arc::new(Mutex::new(false)),
            current_activity: Arc::new(Mutex::new(None)),
            poll_interval: Duration::from_millis(poll_interval_ms),
        }
    }

    /// Categorize application based on name
    fn categorize_app(app_name: &str) -> ActivityCategory {
        let app_lower = app_name.to_lowercase();
        
        // Productive applications
        let productive = [
            "code", "visual studio", "intellij", "pycharm", "sublime",
            "terminal", "iterm", "cmd", "powershell", "postman",
            "docker", "figma", "notion", "obsidian", "excel",
            "word", "powerpoint", "photoshop", "illustrator"
        ];
        
        // Distracting applications
        let distracting = [
            "facebook", "twitter", "instagram", "tiktok", "youtube",
            "reddit", "netflix", "twitch", "discord", "slack",
            "telegram", "whatsapp", "messenger", "spotify"
        ];
        
        for prod in &productive {
            if app_lower.contains(prod) {
                return ActivityCategory::Productive;
            }
        }
        
        for dist in &distracting {
            if app_lower.contains(dist) {
                return ActivityCategory::Distracting;
            }
        }
        
        ActivityCategory::Neutral
    }
}

impl ActivityMonitor for AppMonitor {
    fn start(&mut self) -> Result<()> {
        let mut is_running = self.is_running.lock().unwrap();
        *is_running = true;
        
        log::info!("Application monitor started");
        Ok(())
    }

    fn stop(&mut self) -> Result<()> {
        let mut is_running = self.is_running.lock().unwrap();
        *is_running = false;
        
        log::info!("Application monitor stopped");
        Ok(())
    }

    fn get_active_window(&self) -> Result<ApplicationActivity> {
        #[cfg(target_os = "windows")]
        return get_active_window_windows();
        
        #[cfg(target_os = "macos")]
        return get_active_window_macos();
        
        #[cfg(target_os = "linux")]
        return get_active_window_linux();
    }

    fn get_running_apps(&self) -> Result<Vec<String>> {
        #[cfg(target_os = "windows")]
        return get_running_apps_windows();
        
        #[cfg(target_os = "macos")]
        return get_running_apps_macos();
        
        #[cfg(target_os = "linux")]
        return get_running_apps_linux();
    }

    fn is_idle(&self, threshold_seconds: u64) -> Result<bool> {
        #[cfg(target_os = "windows")]
        return is_idle_windows(threshold_seconds);
        
        #[cfg(target_os = "macos")]
        return is_idle_macos(threshold_seconds);
        
        #[cfg(target_os = "linux")]
        return is_idle_linux(threshold_seconds);
    }
}

// Windows implementation
#[cfg(target_os = "windows")]
fn get_active_window_windows() -> Result<ApplicationActivity> {
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId};
    use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
    use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
    
    unsafe {
        let hwnd = GetForegroundWindow();
        let mut window_title = [0u16; 512];
        let len = GetWindowTextW(hwnd, &mut window_title);
        let title = String::from_utf16_lossy(&window_title[..len as usize]);
        
        let mut process_id = 0;
        GetWindowThreadProcessId(hwnd, Some(&mut process_id));
        
        let process_handle = OpenProcess(
            PROCESS_QUERY_INFORMATION | PROCESS_VM_READ,
            false,
            process_id
        )?;
        
        let mut exe_path = [0u16; 512];
        let path_len = GetModuleFileNameExW(process_handle, None, &mut exe_path);
        let path = String::from_utf16_lossy(&exe_path[..path_len as usize]);
        
        let process_name = std::path::Path::new(&path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Unknown")
            .to_string();
        
        Ok(ApplicationActivity {
            process_name: process_name.clone(),
            window_title: title,
            executable_path: path,
            start_time: Utc::now(),
            end_time: None,
            duration: 0,
            category: AppMonitor::categorize_app(&process_name),
            is_fullscreen: false,
        })
    }
}

#[cfg(target_os = "windows")]
fn get_running_apps_windows() -> Result<Vec<String>> {
    // TODO: Implement using Windows API
    Ok(vec![])
}

#[cfg(target_os = "windows")]
fn is_idle_windows(threshold_seconds: u64) -> Result<bool> {
    use windows::Win32::UI::Input::KeyboardAndMouse::GetLastInputInfo;
    use windows::Win32::UI::Input::KeyboardAndMouse::LASTINPUTINFO;
    use windows::Win32::System::SystemInformation::GetTickCount;
    
    unsafe {
        let mut last_input = LASTINPUTINFO {
            cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        
        let success = GetLastInputInfo(&mut last_input);
        if success.as_bool() {
            let current_tick = GetTickCount();
            let idle_time = (current_tick - last_input.dwTime) / 1000; // Convert to seconds
            
            Ok(idle_time as u64 >= threshold_seconds)
        } else {
            Err(anyhow::anyhow!("Failed to get last input info"))
        }
    }
}

// macOS implementation
#[cfg(target_os = "macos")]
fn get_active_window_macos() -> Result<ApplicationActivity> {
    // TODO: Implement using NSWorkspace and Accessibility API
    Ok(ApplicationActivity {
        process_name: "Unknown".to_string(),
        window_title: "Unknown".to_string(),
        executable_path: "".to_string(),
        start_time: Utc::now(),
        end_time: None,
        duration: 0,
        category: ActivityCategory::Unknown,
        is_fullscreen: false,
    })
}

#[cfg(target_os = "macos")]
fn get_running_apps_macos() -> Result<Vec<String>> {
    Ok(vec![])
}

#[cfg(target_os = "macos")]
fn is_idle_macos(threshold_seconds: u64) -> Result<bool> {
    Ok(false)
}

// Linux implementation
#[cfg(target_os = "linux")]
fn get_active_window_linux() -> Result<ApplicationActivity> {
    // TODO: Implement using X11/Wayland
    Ok(ApplicationActivity {
        process_name: "Unknown".to_string(),
        window_title: "Unknown".to_string(),
        executable_path: "".to_string(),
        start_time: Utc::now(),
        end_time: None,
        duration: 0,
        category: ActivityCategory::Unknown,
        is_fullscreen: false,
    })
}

#[cfg(target_os = "linux")]
fn get_running_apps_linux() -> Result<Vec<String>> {
    Ok(vec![])
}

#[cfg(target_os = "linux")]
fn is_idle_linux(threshold_seconds: u64) -> Result<bool> {
    Ok(false)
}
