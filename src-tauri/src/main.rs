// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::exit;

use tauri::{
    AppHandle, Manager, Menu, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, Wry,
};

mod ws;
mod client;
mod control;

// reference: https://qiita.com/namn1125/items/8ed4d91d3d00af8750f8

fn create_menu() -> Menu {
    let quit = tauri::CustomMenuItem::new("quit".to_string(), "Quit");

    let submenu_file_items = Menu::new().add_item(quit);
    let submenu_file = tauri::Submenu::new("File", submenu_file_items);

    let menu = Menu::new().add_submenu(submenu_file);

    menu
}

fn handle_menu(event: tauri::WindowMenuEvent<Wry>) {
    match event.menu_item_id() {
        "quit" => {
            exit(0);
        }
        _ => {}
    }
}

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
        .plugin(tauri_plugin_websocket::init())
        .on_window_event(handle_window)
        .menu(create_menu())
        .on_menu_event(handle_menu)
        .system_tray(create_systemtray())
        .on_system_tray_event(handle_systemtray)
        .setup(|app: &mut tauri::App| {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();

            let _config_window = app.get_window("config").unwrap();
            let _config_directory_path = app
                .path_resolver()
                .app_local_data_dir()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string();

            println!("config_directory_path: {:?}", _config_directory_path.clone());

            tauri::async_runtime::spawn(ws::start_server(_config_directory_path));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
