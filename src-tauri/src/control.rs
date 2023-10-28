use std::{collections::HashMap, path, fs::{File, self}, process::Command};
use serde::{Deserialize, Serialize};

use crate::{control::hotkey::{KeySequence, KeybdKeyStreamInitializer, KeybdKeyStreamHandler}, client::ReceivedEmitMessageData};

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
pub struct ControlHooks {
    value: Vec<String>
}

pub trait ControlHandler {
    fn get_value(&self) -> Result<String, String>;
}

impl ControlHandler for ControlHooks {
    fn get_value(&self) -> Result<String, String> {

        let first = self.value.first();
        if first.is_none() {
            return Err("Invalid hook".to_string());
        }

        let args = &self.value[1..];

        let stdout = Command::new(first.unwrap())
            .args(args)
            .output()
            .expect("failed to execute process");

        return Ok(String::from_utf8(stdout.stdout).unwrap());
    }
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
    pub hooks: Option<ControlHooks>,
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
    fn emit(&self, event_name: String, context: Option<String>, data: Option<ReceivedEmitMessageData>) -> Result<(), String>;
}

impl EmitHandler for Control {
    fn emit(&self, _event: String, context: Option<String>, _payload: Option<ReceivedEmitMessageData>) -> Result<(), String> {

        match self.r#type.as_str() {
            "command" => {
                if let Some(command) = &self.command {
                    if let Err(e) = command::send(command, None) {
                        eprintln!("Error: {}", e);
                    }

                } else if let Some(commands) = &self.commands {
                    let first = commands.first();
                    let args = &commands[1..].to_vec().iter().map(|arg| {
                        let context = context.clone().unwrap_or("".to_string());
                        arg.replace("{context}", &context)

                    }).collect::<Vec<String>>();

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

    let try_control_config = std::fs::read_to_string(control_file_path_str.clone());
    if let Err(_) = try_control_config {
        File::create(control_file_path_str.clone()).unwrap();
        fs::write(control_file_path_str.clone(), "[]").unwrap();

        return vec![];
    }

    let control_config = try_control_config.unwrap();
    let try_controls: Result<Vec<Control>, serde_json::Error> = serde_json::from_str(&control_config);

    if let Err(e) = try_controls {
        eprintln!("Error: {}: {}", e, control_file_path_str);
        return vec![]
    }

    let controls = try_controls.unwrap();

    controls
}


pub fn get_sheet_list(config_dir: String) -> Vec<Sheet> {
    let sheet_file_path_str = format!("{}{}{}", config_dir, path::MAIN_SEPARATOR, "sheets.json");

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
            eprintln!("Error: {}: {}", e, sheet_file_path_str);
            vec![]
        }
    }
}
