use std::{collections::HashMap, process::Command};

use serde::{Deserialize, Serialize};
use tokio_tungstenite::tungstenite::Message;

use crate::control::{Control, Sheet, EmitHandler, get_control_list, get_sheet_list};

#[derive(Serialize, Deserialize, Debug)]
enum ClientSheetItemDefault {
    String(String),
    Number(i32),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClientSheetItem {
    style: String,
    control_id: Option<String>,
    label: Option<String>,
    disabled: Option<bool>,
    default: Option<ClientSheetItemDefault>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClientSheet {
    columns: i32,
    items: Vec<ClientSheetItem>,
}



#[derive(Serialize, Deserialize, Debug)]
pub struct SendSheetsUpdateMessage {
    pub method: String,
    pub data: Vec<ClientSheet>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ReceivedMessage {
    pub method: String,
    pub data: Option<ReceivedEmitMessage>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ReceivedEmitMessage {
    pub action: String,
    pub event: String,
    pub data: Option<HashMap<String, String>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct State {
    pub config_dir: String,
    pub controls: Vec<Control>,
    pub sheets: Vec<Sheet>,
}

pub trait SendWebSocketClientMessage {
    fn sheets_update(&self) -> Message;
}

impl SendWebSocketClientMessage for State {
    fn sheets_update(&self) -> Message {

        let controls = get_control_list(self.config_dir.clone());
        let data: Vec<ClientSheet> = self.sheets.iter().map(|s| {
            let items: Vec<ClientSheetItem> = s.items.iter().map(|i| {

                match i.control_id {
                    Some(ref control_id) => {
                        let control = controls.iter().find(|&c| c.id == control_id.as_str());

                        match control {
                            Some(c) => {

                                let mut default: Option<ClientSheetItemDefault> = None;

                                match c.default {
                                    Some(ref d) => {

                                        match d.command {
                                            Some(ref command_str) => {
                                                let command_result = Command::new(command_str).output().expect("failed to execute process");
                                                default = String::from_utf8(command_result.stdout).unwrap().trim().parse::<i32>().ok().map(|n| ClientSheetItemDefault::Number(n));
                                            },
                                            None => {

                                            }
                                        }
                                    },
                                    None => {}
                                }

                                ClientSheetItem {
                                    style: i.r#type.clone(),
                                    control_id: i.control_id.clone(),
                                    label: i.label.clone(),
                                    disabled: Some(false),
                                    default: default,
                                }
                            },
                            None => {
                                ClientSheetItem {
                                    style: "empty".to_string(),
                                    control_id: None,
                                    label: None,
                                    disabled: None,
                                    default: None,
                                }
                            }
                        }

                    },
                    None => {
                        ClientSheetItem {
                            style: "empty".to_string(),
                            control_id: None,
                            label: None,
                            disabled: None,
                            default: None,
                        }
                    }
                }

            }).collect();

            ClientSheet {
                columns: s.columns,
                items: items,
            }
        }).collect();

        let message = SendSheetsUpdateMessage {
            method: "sheets.update".to_string(),
            data: data,
        };

        Message::Text(serde_json::to_string(&message).unwrap())
    }
}

pub trait ReceiveWebSocketClientMessage {
    fn emit(&self, control_id: String, event_name: String) -> Result<(), String>;
}

impl ReceiveWebSocketClientMessage for State {
    fn emit(&self, action: String, event: String) -> Result<(), String> {

        let control = self.controls.iter().find(|&c| c.id == action);

        match control {
            Some(c) => {
                if let Err(e) = c.emit(event) {
                    println!("Error: {}", e);
                    Err(e)
                } else {
                    Ok(())
                }
            },
            None => {
                println!("Unknown control: {:?}", action);
                Err("control not found".to_string())
            }
        }
    }
}


pub fn load_state(config_dir: String) -> State {

    let sheets = get_sheet_list(config_dir.clone());
    let controls = get_control_list(config_dir.clone());

    let state = State {
        config_dir: config_dir,
        controls: controls,
        sheets: sheets,
    };

    state
}
