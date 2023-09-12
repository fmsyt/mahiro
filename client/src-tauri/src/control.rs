use std::{collections::HashMap, path, process::Command, env, io};
use serde::{Deserialize, Serialize};

pub enum ControlType {
    Command(String),
    Browser(String),
    Hotkey(String),
}

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
    pub label: Option<String>,
    pub disabled: Option<bool>,
    pub default: Option<ControlDefault>,
    pub props: Option<HashMap<String, i32>>,
    pub platform: Option<String>,
    pub url: Option<String>,
    pub command: Option<String>,
    pub commands: Option<Vec<String>>,
    pub hotkey: Option<String>,
    pub hotkeys: Option<Vec<String>>,
    pub sync: Option<bool>,
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
                    println!("command: {}", command);
                    if let Err(e) = Command::new(command).spawn() {
                        eprintln!("Error: {}", e);
                    }

                } else if let Some(commands) = &self.commands {
                    println!("commands: {:?}", commands);
                    let first = commands.first();
                    let args = &commands[1..];

                    if let Err(e) = Command::new(first.unwrap()).args(args).spawn() {
                        eprintln!("Error: {}", e);
                    }

                } else {
                    eprintln!("Error: Invalid command control: {}", self.id);
                }
            }
            "browser" => {
                println!("browser");
                if let Some(url) = &self.url {

                    let command_result = match env::consts::OS {
                        "windows" => {
                            Command::new("cmd.exe").args(["/c", "start", url]).spawn()
                        }
                        "macos" => {
                            Command::new("open").args([url]).spawn()
                        }
                        "linux" => {
                            Command::new("xdg-open").args([url]).spawn()
                        }
                        _ => {
                            eprintln!("Error: Unsupported platform: {}", env::consts::OS);
                            Err(io::Error::new(io::ErrorKind::Other, "Unsupported platform"))
                        }
                    };

                    println!("url: {}", url);
                    if let Err(e) = command_result {
                        eprintln!("Error: {}", e);
                    }

                } else {
                    eprintln!("Error: Invalid browser control: {}", self.id);
                }
            }
            "hotkey" => {
                println!("hotkey");
            }
            "keyboard" => {
                println!("keyboard");
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
                    println!("Error: {}: {}", e, control_file_path_str);
                    vec![]
                }
            }
        }
        Err(e) => {
            println!("Error: {}: {}", e, control_file_path_str);
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
                    println!("Error: {}: {}", e, sheet_file_path_str);
                    vec![]
                }
            }
        }
        Err(e) => {
            println!("Error: {}: {}", e, sheet_file_path_str);
            vec![]
        }
    };

    sheets
}
