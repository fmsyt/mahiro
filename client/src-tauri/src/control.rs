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
            let controls: Vec<Control> = serde_json::from_str(&config).expect("Failed to parse config on load_controls");
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
            let sheets: Vec<Sheet> = serde_json::from_str(&config).expect("Failed to parse config on load_sheets");
            sheets
        }
        Err(e) => {
            println!("Error: {}", e);
            vec![]
        }
    }
}

trait ConfigFile<T> {
    fn load(&self, path: String) -> T;
}

impl ConfigFile for Sheet {
    fn load(&self, path: String) -> Sheet {
        let config = std::fs::read_to_string(path);

        match config {
            Ok(config) => {
                let sheets: Vec<Sheet> = serde_json::from_str(&config).expect("Failed to parse config on load_sheets");
                sheets
            }
            Err(e) => {
                println!("Error: {}", e);
                vec![]
            }
        }
    }
}

impl ConfigFile for Control {
    fn load(&self, path: String) -> Control {
        let config = std::fs::read_to_string(path);
        let control: Control = serde_json::from_str(&config).expect("Failed to parse config on load_controls");

        control
    }
}

pub trait Controller {
    fn emit(&self, control: Control) {
        println!("emit: {:?}", control);
    }
}
