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
pub struct SheetItem {
    pub control_id: Option<String>,
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
