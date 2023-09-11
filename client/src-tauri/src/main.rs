// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    AppHandle, Manager, Menu, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, Wry,
};

mod ws;
mod client;
mod control;

// reference: https://qiita.com/namn1125/items/8ed4d91d3d00af8750f8

fn create_menu() -> Menu {
    let quit = tauri::CustomMenuItem::new("quit".to_string(), "Quit");
    let close = tauri::CustomMenuItem::new("close".to_string(), "Close");

    let submenu = tauri::Submenu::new("File", Menu::new().add_item(quit).add_item(close));

    let menu = Menu::new().add_submenu(submenu);

    menu
}

fn handle_menu(event: tauri::WindowMenuEvent<Wry>) {
    match event.menu_item_id() {
        "quit" | "close" => event.window().close().unwrap(),
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
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "open_config" => {
                let window = app.get_window("config").unwrap();
                window.show().unwrap();
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_websocket::init())
        .menu(create_menu())
        .on_menu_event(handle_menu)
        .system_tray(create_systemtray())
        .on_system_tray_event(handle_systemtray)
        .setup(|app: &mut tauri::App| {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();

            let config_window = app.get_window("config").unwrap();
            config_window.hide().unwrap();

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
