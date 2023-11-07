use std::{
    path::PathBuf,
    fs::{File, self}
};

use serde::{
    Serialize,
    Deserialize
};


// pub enum SheetItemType {
//     Button(String),
//     Slider(String),
//     Empty(String),
// }


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SheetItemAction<T> {
    pub key_down: Option<T>,
    pub key_up: Option<T>,
    pub touch_tap: Option<T>,
    pub dial_down: Option<T>,
    pub dial_up: Option<T>,
    pub dial_rotate: Option<T>,
    pub will_appear: Option<T>,
    pub will_disappear: Option<T>,
    pub title_parameters_did_change: Option<T>,
    pub device_did_connect: Option<T>,
    pub device_did_disconnect: Option<T>,
    pub application_did_launch: Option<T>,
    pub application_did_terminate: Option<T>,
    pub system_did_wake_up: Option<T>,
    pub property_inspector_did_appear: Option<T>,
    pub property_inspector_did_disappear: Option<T>,
    pub send_to_plugin: Option<T>,
}



#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SheetItem {
    pub action: Option<SheetItemAction<String>>,
    pub label: Option<String>,
    pub r#type: String,
    pub disabled: Option<bool>,
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Sheet {
    pub columns: i32,
    pub items: Vec<SheetItem>,
}



pub fn get_sheet_list(config_dir: PathBuf) -> Vec<Sheet> {
    let sheet_file_path_str = config_dir.join("sheets.json");

    let try_sheet_config = std::fs::read_to_string(sheet_file_path_str.clone());
    if let Err(_) = try_sheet_config {
        File::create(sheet_file_path_str.clone()).unwrap();
        fs::write(sheet_file_path_str.clone(), "[]").unwrap();

        return vec![];
    }

    let sheets_json = try_sheet_config.unwrap();
    let try_sheets: Result<Vec<Sheet>, serde_json::Error> = serde_json::from_str(&sheets_json);
    match try_sheets {
        Ok(sheets) => sheets,
        Err(e) => {
            eprintln!("Error: {}: {}", e, sheet_file_path_str.to_str().unwrap());
            vec![]
        }
    }
}
