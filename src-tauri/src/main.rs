// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use server::ServerDirs;
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager
};

use tauri_plugin_autostart::{self, MacosLauncher};

mod client;
mod control;
mod server;
mod sheet;

// #[cfg(debug_assertions)]
// const LOG_TARGETS: [LogTarget; 2] = [LogTarget::Stdout, LogTarget::Stderr];

// #[cfg(not(debug_assertions))]
// const LOG_TARGETS: [LogTarget; 2] = [LogTarget::Stderr, LogTarget::LogDir];

// fn handle_window(event: tauri::GlobalWindowEvent) {
//     match event.event() {
//         tauri::WindowEvent::CloseRequested { api, .. } => {
//             api.prevent_close();
//             event.window().hide().unwrap();
//         }
//         _ => {}
//     }
// }

// fn create_systemtray() -> SystemTray {
//     let open_config = tauri::CustomMenuItem::new("open_config".to_string(), "Config");
//     let quit = tauri::CustomMenuItem::new("quit".to_string(), "Quit");

//     let tray_menu = SystemTrayMenu::new()
//         .add_item(open_config)
//         .add_native_item(SystemTrayMenuItem::Separator)
//         .add_item(quit);

//     let tray = SystemTray::new().with_menu(tray_menu);

//     tray
// }

// fn handle_systemtray(app: &AppHandle<Wry>, event: SystemTrayEvent) {
//     match event {
//         SystemTrayEvent::LeftClick { .. } => {
//             if let Some(window) = app.get_window("main") {
//                 window.show().unwrap();
//                 window.set_focus().unwrap();
//             }
//         }
//         SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
//             "open_config" => {
//                 if let Some(window) = app.get_window("config") {
//                     window.show().unwrap();
//                     window.set_focus().unwrap();
//                 }
//             }
//             "quit" => {
//                 exit(0);
//             }
//             _ => {}
//         },
//         _ => {}
//     }
// }

fn main() {
    #[cfg(target_os = "linux")]
    {
        env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        // .plugin(
        //     tauri_plugin_log::Builder::default()
        //         .targets(LOG_TARGETS)
        //         .with_colors(ColoredLevelConfig::default())
        //         .level(LevelFilter::Info)
        //         .build(),
        // )
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        // .on_window_event(handle_window)
        // .system_tray(create_systemtray())
        // .on_system_tray_event(handle_systemtray)
        .setup(|app: &mut tauri::App| {
            let resolver = app.path();

            let config_directory_path = resolver.config_dir().unwrap();
            let resource_dir = resolver.resource_dir().unwrap();

            let dirs = ServerDirs {
                config_dir: config_directory_path.clone(),
                uploads_dir: config_directory_path.join("assets"),
                html_root_dir: resource_dir.join("static"),
            };

            tauri::async_runtime::spawn(server::start(dirs));

            let quit_menu = MenuItemBuilder::with_id("quit", "終了").build(app)?;
            let menu = MenuBuilder::new(app).item(&quit_menu).build()?;
            let tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(move |tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left | MouseButton::Right,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                })
                .build(app)?;

            let icon = include_bytes!("../icons/icon.ico").to_vec();
            let image = Image::from_bytes(&icon).expect("Failed to load icon image");

            tray.set_icon(Some(image)).expect("Failed to set tray icon");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
