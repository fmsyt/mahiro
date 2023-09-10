use std::path;
use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tokio_tungstenite::tungstenite::Message;

use crate::control::{Control, Sheet, EmitHandler};

#[derive(Serialize, Deserialize, Debug)]
pub struct SendSheetsUpdateMessage {
    pub method: String,
    pub data: Vec<Sheet>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ReceivedMessage {
    pub method: String,
    pub data: Option<ReceivedEmitMessage>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ReceivedEmitMessage {
    pub control_id: String,
    pub event_name: String,
    pub data: Option<HashMap<String, String>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct State {
    pub controls: Vec<Control>,
    pub sheets: Vec<Sheet>,
}

pub trait SendWebSocketClientMessage {
    fn sheets_update(&self) -> Message;
}

impl SendWebSocketClientMessage for State {
    fn sheets_update(&self) -> Message {

        let message = SendSheetsUpdateMessage {
            method: "sheets_update".to_string(),
            data: self.sheets.clone(),
        };

        Message::Text(serde_json::to_string(&message).unwrap())
    }
}

pub trait ReceiveWebSocketClientMessage {
    fn emit(&self, control_id: String, event_name: String) -> Result<(), String>;
}

impl ReceiveWebSocketClientMessage for State {
    fn emit(&self, control_id: String, event_name: String) -> Result<(), String> {
        println!("emit: {:?}", control_id);

        let control = self.controls.iter().find(|&c| c.id == control_id);

        match control {
            Some(c) => {
                println!("control: {:?}", c);
                if let Err(e) = c.emit(event_name) {
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

    let sheet_file_path_str = format!("{}{}{}", config_dir, path::MAIN_SEPARATOR, "sheets.json");

    let sheet_config = std::fs::read_to_string(sheet_file_path_str.clone());
    let sheets: Vec<Sheet> = match sheet_config {
        Ok(config) => serde_json::from_str(&config).expect("Failed to parse config on load_sheets"),
        Err(e) => {
            println!("Error: {}: {}", e, sheet_file_path_str);
            vec![]
        }
    };


    let control_file_path_str = format!("{}{}{}", config_dir, path::MAIN_SEPARATOR, "controls.json");

    let control_config = std::fs::read_to_string(control_file_path_str.clone());
    let controls: Vec<Control> = match control_config {
        Ok(config) => serde_json::from_str(&config).expect("Failed to parse config on load_controls"),
        Err(e) => {
            println!("Error: {}: {}", e, control_file_path_str);
            vec![]
        }
    };

    let state = State {
        controls: controls,
        sheets: sheets,
    };

    state
}
