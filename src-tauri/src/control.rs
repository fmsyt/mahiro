use std::{collections::HashMap, path::PathBuf, fs::{File, self}, process::Command};
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
    pub commands: Option<Vec<String>>,
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

                if self.commands.is_none() {
                    return Ok(())
                }

                let commands = self.commands.clone().unwrap();
                let first = commands.first();
                let args = &commands[1..].to_vec().iter().map(|arg| {
                    let context = context.clone().unwrap_or("".to_string());
                    arg.replace("{context}", &context)

                }).collect::<Vec<String>>();

                if let Err(e) = command::send(first.unwrap(), Some(args.to_vec())) {
                    eprintln!("Error: {}", e);
                }

            }
            "browser" => {

                if self.url.is_none() {
                    return Ok(())
                }

                let url = self.url.clone().unwrap();
                if let Err(e) = browser::browse(url) {
                    eprintln!("Error: {}", e);
                }

            }
            "hotkey" => {

                if self.hotkeys.is_none() {
                    return Ok(())
                }

                let hotkeys = self.hotkeys.clone().unwrap();
                hotkeys.iter().for_each(|hotkey| {
                    let stream = KeySequence::from_string(hotkey.clone());
                    stream.send();
                });
            }
            "keyboard" => {

                if self.text.is_none() {
                    return Ok(())
                }

                let text = self.text.clone().unwrap();
                if let Err(e) = keyboard::send_text(text) {
                    eprintln!("Error: {}", e);
                }

            }
            _ => {
                eprintln!("Error: Invalid control type: {}", self.r#type)
            }
        }

        Ok(())
    }
}





pub fn get_control_list(config_dir: PathBuf) -> Vec<Control> {
    let control_file_path_str = config_dir.join("controls.json");

    let try_control_config = std::fs::read_to_string(control_file_path_str.clone());
    if let Err(_) = try_control_config {
        File::create(control_file_path_str.clone()).unwrap();
        fs::write(control_file_path_str.clone(), "[]").unwrap();

        return vec![];
    }

    let control_config = try_control_config.unwrap();
    let try_controls: Result<Vec<Control>, serde_json::Error> = serde_json::from_str(&control_config);

    if let Err(e) = try_controls {
        eprintln!("Error: {}: {}", e, control_file_path_str.to_str().unwrap());
        return vec![]
    }

    let controls = try_controls.unwrap();

    controls
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
