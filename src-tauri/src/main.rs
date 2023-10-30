// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::exit;

use log::LevelFilter;
use tauri::{
    AppHandle, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, Wry,
};

use tauri_plugin_autostart::{self, MacosLauncher};
use tauri_plugin_log::{fern::colors::ColoredLevelConfig, LogTarget};

mod client;
mod control;
mod server;

#[cfg(debug_assertions)]
const LOG_TARGETS: [LogTarget; 2] = [LogTarget::Stdout, LogTarget::Stderr];

#[cfg(not(debug_assertions))]
const LOG_TARGETS: [LogTarget; 2] = [LogTarget::Stderr, LogTarget::LogDir];


fn handle_window(event: tauri::GlobalWindowEvent) {
    match event.event() {
        tauri::WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            event.window().hide().unwrap();
        }
        _ => {}
    }
}

fn create_systemtray() -> SystemTray {
    let open_config = tauri::CustomMenuItem::new("open_config".to_string(), "Config");
    let quit = tauri::CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(open_config)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let tray = SystemTray::new().with_menu(tray_menu);

    tray
}

fn handle_systemtray(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            if let Some(window) = app.get_window("main") {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "open_config" => {
                if let Some(window) = app.get_window("config") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            "quit" => {
                exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets(LOG_TARGETS)
                .with_colors(ColoredLevelConfig::default())
                .level(LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
        .on_window_event(handle_window)
        .system_tray(create_systemtray())
        .on_system_tray_event(handle_systemtray)
        .setup(|app: &mut tauri::App| {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();

            #[cfg(debug_assertions)]
            {
                window.open_devtools();
                window.close_devtools();
            }

            // let _config_window = app.get_window("config").unwrap();
            let config_directory_path = app.path_resolver();

            tauri::async_runtime::spawn(server::start(config_directory_path));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
