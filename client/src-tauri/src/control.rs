use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Control {
    pub id: String,
    pub r#type: String,
    pub style: Option<String>,
    pub label: String,
    pub disabled: bool,
    pub default: String,
    pub props: HashMap<String, String>,
    pub platform: Option<String>,
    pub url: Option<String>,
    pub command: Option<String>,
    pub commands: Option<Vec<String>>,
    pub hotkey: Option<String>,
    pub hotkeys: Option<Vec<String>>,
    pub sync: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Sheet {
    pub columns: u32,
    pub items: Vec<Control>,
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
    fn load(&self, path: String) -> Result<Control, String> {
        let config = std::fs::read_to_string(path);
        let control: Control = serde_json::from_str(&config).expect("Failed to parse config on load_controls");

        Ok(control)
    }
}

pub trait Controller {
    fn emit(&self) -> Result<(), String>;
}

impl Controller for Control {
    fn emit(&self) -> Result<(), String> {
        Ok(())
    }
}
