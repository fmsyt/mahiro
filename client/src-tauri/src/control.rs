use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Control {
    id: String,
    r#type: String,
    style: Option<String>,
    label: String,
    disabled: bool,
    default: String,
    props: HashMap<String, String>,
    platform: Option<String>,

    url: Option<String>,
    command: Option<String>,
    commands: Option<Vec<String>>,
    hotkey: Option<String>,
    hotkeys: Option<Vec<String>>,
    sync: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Sheet {
    columns: u32,
    items: Vec<Control>,
}

pub fn load_controls(path: String) -> Vec<Control> {

    let config = std::fs::read_to_string(path);

    match config {
        Ok(config) => {
            let controls = serde_json::from_str::<Vec<Control>>(&config).unwrap();
            controls
        }
        Err(e) => {
            println!("Error: {}", e);
            vec![]
        }
    }
}

pub fn load_sheets(path: String) -> Vec<Sheet> {

    let config = std::fs::read_to_string(path);

    match config {
        Ok(config) => {
            let sheets = serde_json::from_str::<Vec<Sheet>>(&config).unwrap();
            sheets
        }
        Err(e) => {
            println!("Error: {}", e);
            vec![]
        }
    }
}


pub trait Controller {
    fn emit(&self, control: Control) {
        println!("emit: {:?}", control);
    }
}
