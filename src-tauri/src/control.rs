use std::{collections::HashMap, path};
use serde::{Deserialize, Serialize};

use crate::control::hotkey::{KeySequence, KeybdKeyStreamInitializer, KeybdKeyStreamHandler};

mod command;
mod browser;
mod hotkey;
mod keyboard;

// pub enum ControlType {
//     Command(String),
//     Browser(String),
//     Hotkey(String),
// }

// pub enum ControlPlatform {
//     Windows(String),
//     Macos(String),
//     Linux(String),
// }

#[derive(Serialize, Deserialize, Debug)]
pub enum ControlPropsType {
    Number(i32),
    String(String),
}


#[derive(Serialize, Deserialize, Debug)]
pub enum ControlDefaultValueType {
    Number(i32),
    String(String),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ControlDefault {
    pub command: Option<String>,
    pub value: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Control {
    pub id: String,
    pub r#type: String,
    pub style: Option<String>,
    pub default: Option<ControlDefault>,
    pub props: Option<HashMap<String, i32>>,
    pub platform: Option<String>,
    pub url: Option<String>,
    pub command: Option<String>,
    pub commands: Option<Vec<String>>,
    pub hotkey: Option<String>,
    pub hotkeys: Option<Vec<String>>,
    pub sync: Option<bool>,
    pub text: Option<String>,
    pub icon: Option<String>,
    pub description: Option<String>,
}



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






pub trait EmitHandler {
    fn emit(&self, event_name: String) -> Result<(), String>;
}

impl EmitHandler for Control {
    fn emit(&self, _event: String) -> Result<(), String> {

        match self.r#type.as_str() {
            "command" => {
                if let Some(command) = &self.command {
                    if let Err(e) = command::send(command, None) {
                        eprintln!("Error: {}", e);
                    }

                } else if let Some(commands) = &self.commands {
                    let first = commands.first();
                    let args = &commands[1..];

                    if let Err(e) = command::send(first.unwrap(), Some(args.to_vec())) {
                        eprintln!("Error: {}", e);
                    }

                } else {
                    eprintln!("Error: Invalid command control: {}", self.id);
                }
            }
            "browser" => {
                if let Some(url) = &self.url {
                    if let Err(e) = browser::browse(url) {
                        eprintln!("Error: {}", e);
                    }

                } else {
                    eprintln!("Error: Invalid browser control: {}", self.id);
                }
            }
            "hotkey" => {
                if let Some(hotkey) = &self.hotkey {

                    let stream = KeySequence::from_string(hotkey.clone());
                    stream.send();

                } else if let Some(hotkeys) = &self.hotkeys {

                    hotkeys.iter().for_each(|hotkey| {
                        let stream = KeySequence::from_string(hotkey.clone());
                        stream.send();
                    });

                } else {
                    eprintln!("Error: Invalid hotkey control: {}", self.id);
                }
            }
            "keyboard" => {
                if let Some(text) = &self.text {
                    if let Err(e) = keyboard::send_text(text.clone()) {
                        eprintln!("Error: {}", e);
                    }

                } else {
                    eprintln!("Error: Invalid keyboard control: {}", self.id);
                }
            }
            _ => {
                eprintln!("Error: Invalid control type: {}", self.r#type)
            }
        }

        Ok(())
    }
}





pub fn get_control_list(config_dir: String) -> Vec<Control> {
    let control_file_path_str = format!("{}{}{}", config_dir, path::MAIN_SEPARATOR, "controls.json");

    let control_config = std::fs::read_to_string(control_file_path_str.clone());
    let controls: Vec<Control> = match control_config {
        Ok(config) => {
            let c: Result<Vec<Control>, serde_json::Error> = serde_json::from_str(&config);
            match c {
                Ok(controls) => controls,
                Err(e) => {
                    eprintln!("Error: {}: {}", e, control_file_path_str);
                    vec![]
                }
            }
        }
        Err(e) => {
            eprintln!("Error: {}: {}", e, control_file_path_str);
            vec![]
        }
    };

    controls
}


pub fn get_sheet_list(config_dir: String) -> Vec<Sheet> {
    let sheet_file_path_str = format!("{}{}{}", config_dir, path::MAIN_SEPARATOR, "sheets.json");

    let sheet_config = std::fs::read_to_string(sheet_file_path_str.clone());
    let sheets: Vec<Sheet> = match sheet_config {
        Ok(config) => {
            let s: Result<Vec<Sheet>, serde_json::Error> = serde_json::from_str(&config);
            match s {
                Ok(sheets) => sheets,
                Err(e) => {
                    eprintln!("Error: {}: {}", e, sheet_file_path_str);
                    vec![]
                }
            }
        }
        Err(e) => {
            eprintln!("Error: {}: {}", e, sheet_file_path_str);
            vec![]
        }
    };

    sheets
}
