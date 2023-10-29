use std::process::Command;
use serde::{Deserialize, Serialize};

use crate::control::{Control, Sheet, EmitHandler, get_control_list, get_sheet_list, ControlHandler};

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
    value: Option<String>,
    icon: Option<String>,
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
    pub context: Option<String>,
    pub payload: Option<ReceivedEmitMessageData>,
}


#[derive(Serialize, Deserialize, Debug)]

pub struct ReceivedEmitMessageData {
    pub context: String,
}


#[derive(Serialize, Deserialize, Debug)]
pub struct State {
    pub config_dir: String,
    pub controls: Vec<Control>,
    pub sheets: Vec<Sheet>,
}

pub trait SendWebSocketClientMessage {
    fn sheets_update(&self) -> SendSheetsUpdateMessage;
}

impl SendWebSocketClientMessage for State {
    fn sheets_update(&self) -> SendSheetsUpdateMessage {

        let controls = get_control_list(self.config_dir.clone());
        let data: Vec<ClientSheet> = self.sheets.iter().map(|s| {
            let items: Vec<ClientSheetItem> = s.items.iter().map(|i| {

                match i.control_id {
                    Some(ref control_id) => {
                        let control = controls.iter().find(|&c| c.id == control_id.as_str());

                        match control {
                            Some(c) => {

                                let mut default: Option<ClientSheetItemDefault> = None;
                                let mut value = None;
                                if let Some(ref hooks) = c.hooks {
                                    println!("hooks: {:?}", hooks);
                                    if let Ok(stdout) = hooks.get_value() {
                                        println!("stdout: {}", stdout);
                                        value = Some(stdout);
                                    }
                                }

                                let icon = match c.icon {
                                    Some(ref i) => Some(i.clone()),
                                    None => None,
                                };

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
                                    default,
                                    value,
                                    icon,
                                }
                            },
                            None => {
                                ClientSheetItem {
                                    style: "empty".to_string(),
                                    control_id: None,
                                    label: None,
                                    disabled: None,
                                    default: None,
                                    value: None,
                                    icon: None,
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
                            value: None,
                            icon: None,
                        }
                    }
                }

            }).collect();

            ClientSheet {
                columns: s.columns,
                items,
            }
        }).collect();

        let message = SendSheetsUpdateMessage {
            method: "sheets.update".to_string(),
            data,
        };

        return message
    }
}

pub trait ReceiveWebSocketClientMessage {
    fn emit(&self, control_id: String, event_name: String, context: Option<String>, payload: Option<ReceivedEmitMessageData>) -> Result<(), String>;
}

impl ReceiveWebSocketClientMessage for State {
    fn emit(&self, control_id: String, event_name: String, context: Option<String>, payload: Option<ReceivedEmitMessageData>) -> Result<(), String> {

        let control = self.controls.iter().find(|&c| c.id == control_id);

        match control {
            Some(c) => {
                if let Err(e) = c.emit(event_name, context, payload) {
                    println!("Error: {}", e);
                    Err(e)
                } else {
                    Ok(())
                }
            },
            None => {
                println!("Unknown control: {:?}", control_id);
                Err("control not found".to_string())
            }
        }
    }
}


pub fn load_state(config_dir: String) -> State {

    let sheets = get_sheet_list(config_dir.clone());
    let controls = get_control_list(config_dir.clone());

    let state = State {
        config_dir,
        controls,
        sheets,
    };

    state
}
