use std::{collections::HashMap, path, process::Command, env, io};
use inputbot::{get_keybd_key, KeybdKey};
use serde::{Deserialize, Serialize};

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
    pub text: Option<String>,
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




#[derive(Debug)]
struct KeybdKeyStream {
    special_keys: Vec<KeybdKey>,
    char_keys: Vec<KeybdKey>,
}

trait KeybdKeyStreamInitializer {
    fn from_string(s: String) -> Self;
    // fn from_code(code: u64) -> Self;
}

impl KeybdKeyStreamInitializer for KeybdKeyStream {
    fn from_string(s: String) -> Self {
        let combined_hotkey = s.split("+").collect::<Vec<&str>>();

        let mut press_special_keys: Vec<KeybdKey> = vec![];
        let mut press_char_keys: Vec<KeybdKey> = vec![];

        combined_hotkey.iter().for_each(|key| {

            match key.to_lowercase().as_str() {
                "ctrl" => press_special_keys.push(inputbot::KeybdKey::LControlKey),
                "alt" => press_special_keys.push(inputbot::KeybdKey::LAltKey),
                "shift" => press_special_keys.push(inputbot::KeybdKey::LShiftKey),
                _ => {
                    if let Some(c) = key.chars().next() {
                        if let Some(k) = get_keybd_key(c) {
                            press_char_keys.push(k);
                        }
                    }
                }
            }
        });

        KeybdKeyStream {
            special_keys: press_special_keys,
            char_keys: press_char_keys,
        }
    }
}

trait KeybdKeyStreamHandler {
    fn send(&self);
}

impl KeybdKeyStreamHandler for KeybdKeyStream {
    fn send(&self) {
        self.special_keys.iter().for_each(|key| {
            inputbot::KeybdKey::press(*key);
        });

        self.char_keys.iter().for_each(|key| {
            inputbot::KeybdKey::press(*key);
        });

        self.char_keys.iter().for_each(|key| {
            inputbot::KeybdKey::release(*key);
        });
    }
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
                if let Some(hotkey) = &self.hotkey {
                    println!("hotkey: {}", hotkey);

                    let stream = KeybdKeyStream::from_string(hotkey.clone());
                    stream.send();

                } else if let Some(hotkeys) = &self.hotkeys {
                    println!("hotkeys: {:?}", hotkeys);

                    hotkeys.iter().for_each(|hotkey| {
                        let stream = KeybdKeyStream::from_string(hotkey.clone());
                        stream.send();
                    });

                } else {
                    eprintln!("Error: Invalid hotkey control: {}", self.id);
                }
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
