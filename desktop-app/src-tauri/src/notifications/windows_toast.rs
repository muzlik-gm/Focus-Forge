// Windows-specific toast notification implementation
// This module provides proper Windows notification support with correct app identity

#[cfg(target_os = "windows")]
pub mod windows_notifications {
    use anyhow::Result;
    use windows::core::HSTRING;
    use windows::Data::Xml::Dom::XmlDocument;
    use windows::UI::Notifications::{ToastNotification, ToastNotificationManager};

    pub fn send_toast_notification(title: &str, body: &str) -> Result<()> {
        unsafe {
            // Create XML for toast notification
            let xml_content = format!(
                r#"<toast>
                    <visual>
                        <binding template="ToastGeneric">
                            <text>{}</text>
                            <text>{}</text>
                            <image placement="appLogoOverride" src="file:///C:/Windows/System32/imageres.dll,-1043"/>
                        </binding>
                    </visual>
                </toast>"#,
                title, body
            );

            let xml = XmlDocument::new()?;
            xml.LoadXml(&HSTRING::from(xml_content))?;

            let toast = ToastNotification::CreateToastNotification(&xml)?;
            
            // Use the app identifier from Tauri config
            let app_id = HSTRING::from("com.forgrinop");
            let notifier = ToastNotificationManager::CreateToastNotifierWithId(&app_id)?;
            
            notifier.Show(&toast)?;
            
            Ok(())
        }
    }
}

#[cfg(not(target_os = "windows"))]
pub mod windows_notifications {
    use anyhow::Result;
    
    pub fn send_toast_notification(_title: &str, _body: &str) -> Result<()> {
        Ok(())
    }
}
