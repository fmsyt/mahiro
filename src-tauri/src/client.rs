use std::{path::PathBuf, fmt::Display};
use serde::{Deserialize, Serialize};

use crate::{
    control::{
        Control,
        EmitHandler,
        get_control_list, InitializeHandler,
    },
    sheet::{
        Sheet,
        get_sheet_list, SheetItem, SheetItemAction,
    }
};

#[derive(Serialize, Deserialize, Debug)]
enum ClientSheetItemInitialize {
    String(String),
    Number(i32),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClientSheetItem {
    style: String,
    action: Option<SheetItemAction<String>>,
    label: Option<String>,
    disabled: Option<bool>,
    value: Option<String>,
    icon: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClientSheetItemDelta {
    pub action: String,
    pub value: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClientSheet {
    columns: i32,
    items: Vec<ClientSheetItem>,
}


#[derive(Serialize, Deserialize, Debug)]
pub enum ActionEvents {
    KeyDown,
    KeyUp,
    TouchTap,
    DialDown,
    DialUp,
    DialRotate,
    WillAppear,
    WillDisappear,
    TitleParametersDidChange,
    DeviceDidConnect,
    DeviceDidDisconnect,
    ApplicationDidLaunch,
    ApplicationDidTerminate,
    SystemDidWakeUp,
    PropertyInspectorDidAppear,
    PropertyInspectorDidDisappear,
    SendToPlugin,
}

impl Display for ActionEvents {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ActionEvents::KeyDown => write!(f, "keyDown"),
            ActionEvents::KeyUp => write!(f, "keyUp"),
            ActionEvents::TouchTap => write!(f, "touchTap"),
            ActionEvents::DialDown => write!(f, "dialDown"),
            ActionEvents::DialUp => write!(f, "dialUp"),
            ActionEvents::DialRotate => write!(f, "dialRotate"),
            ActionEvents::WillAppear => write!(f, "willAppear"),
            ActionEvents::WillDisappear => write!(f, "willDisappear"),
            ActionEvents::TitleParametersDidChange => write!(f, "titleParametersDidChange"),
            ActionEvents::DeviceDidConnect => write!(f, "deviceDidConnect"),
            ActionEvents::DeviceDidDisconnect => write!(f, "deviceDidDisconnect"),
            ActionEvents::ApplicationDidLaunch => write!(f, "applicationDidLaunch"),
            ActionEvents::ApplicationDidTerminate => write!(f, "applicationDidTerminate"),
            ActionEvents::SystemDidWakeUp => write!(f, "systemDidWakeUp"),
            ActionEvents::PropertyInspectorDidAppear => write!(f, "propertyInspectorDidAppear"),
            ActionEvents::PropertyInspectorDidDisappear => write!(f, "propertyInspectorDidDisappear"),
            ActionEvents::SendToPlugin => write!(f, "sendToPlugin"),
        }
    }
}

impl From<String> for ActionEvents {
    fn from(value: String) -> Self {
        match value.as_str() {
            "keyDown" => ActionEvents::KeyDown,
            "keyUp" => ActionEvents::KeyUp,
            "touchTap" => ActionEvents::TouchTap,
            "dialDown" => ActionEvents::DialDown,
            "dialUp" => ActionEvents::DialUp,
            "dialRotate" => ActionEvents::DialRotate,
            "willAppear" => ActionEvents::WillAppear,
            "willDisappear" => ActionEvents::WillDisappear,
            "titleParametersDidChange" => ActionEvents::TitleParametersDidChange,
            "deviceDidConnect" => ActionEvents::DeviceDidConnect,
            "deviceDidDisconnect" => ActionEvents::DeviceDidDisconnect,
            "applicationDidLaunch" => ActionEvents::ApplicationDidLaunch,
            "applicationDidTerminate" => ActionEvents::ApplicationDidTerminate,
            "systemDidWakeUp" => ActionEvents::SystemDidWakeUp,
            "propertyInspectorDidAppear" => ActionEvents::PropertyInspectorDidAppear,
            "propertyInspectorDidDisappear" => ActionEvents::PropertyInspectorDidDisappear,
            "sendToPlugin" => ActionEvents::SendToPlugin,
            _ => ActionEvents::KeyDown,
        }
    }
}

pub trait Convert {
    fn to_client_sheet_item(&self, controls: &Vec<Control>) -> ClientSheetItem;
}

impl Convert for SheetItem {
    fn to_client_sheet_item(&self, controls: &Vec<Control>) -> ClientSheetItem {

        if self.action.is_none() {
            return ClientSheetItem {
                style: "empty".to_string(),
                action: None,
                label: None,
                disabled: None,
                value: None,
                icon: None,
            }
        }

        let control_id = self.action.clone().unwrap();
        let control_option = controls.iter().find(|&c| {

            // print type of control_id
            if control_id.key_down.is_some() {
                if c.id == control_id.key_down.clone().unwrap() {
                    return true
                }
            }

            if control_id.key_up.is_some() {
                if c.id == control_id.key_up.clone().unwrap() {
                    return true
                }
            }

            return false
        });

        if control_option.is_none() {
            return ClientSheetItem {
                style: "empty".to_string(),
                action: None,
                label: None,
                disabled: None,
                value: None,
                icon: None,
            }
        }

        let control = control_option.unwrap();

        let value = control.get_value();
        let icon = match control.icon {
            Some(ref i) => Some(i.clone()),
            None => None,
        };

        ClientSheetItem {
            style: self.r#type.clone(),
            action: self.action.clone(),
            label: self.label.clone(),
            disabled: Some(false),
            value,
            icon,
        }

    }
}



#[derive(Serialize, Deserialize, Debug)]
pub struct SendSheetItemUpdateMessage {
    pub method: String,
    pub data: ClientSheetItemDelta,
}

impl From<ClientSheetItemDelta> for SendSheetItemUpdateMessage {
    fn from(value: ClientSheetItemDelta) -> Self {
        SendSheetItemUpdateMessage {
            method: "sheet.item.update".to_string(),
            data: value,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SendSheetsUpdateMessage {
    pub method: String,
    pub data: Vec<ClientSheet>,
}

impl From<Vec<ClientSheet>> for SendSheetsUpdateMessage {
    fn from(value: Vec<ClientSheet>) -> Self {
        SendSheetsUpdateMessage {
            method: "sheets.update".to_string(),
            data: value,
        }
    }
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
    pub config_dir: PathBuf,
    pub controls: Vec<Control>,
    pub sheets: Vec<Sheet>,
}

pub trait SendWebSocketClientMessage {
    fn sheets_update(&self) -> SendSheetsUpdateMessage;
}

impl SendWebSocketClientMessage for State {
    fn sheets_update(&self) -> SendSheetsUpdateMessage {

        let controls = get_control_list(self.config_dir.clone());
        let data: Vec<ClientSheet> = self.sheets.iter().map(|sheet| {
            let items = sheet.items.iter().map(|sheet_item| sheet_item.to_client_sheet_item(&controls)).collect();

            ClientSheet {
                columns: sheet.columns,
                items,
            }
        }).collect();

        SendSheetsUpdateMessage::from(data)
    }
}

pub trait ReceiveWebSocketClientMessage {
    fn emit(&self, control_id: String, event_name: String, context: Option<String>, payload: Option<ReceivedEmitMessageData>) -> Result<Option<ClientSheetItemDelta>, String>;
}

impl ReceiveWebSocketClientMessage for State {
    fn emit(&self, control_id: String, event_name: String, context: Option<String>, payload: Option<ReceivedEmitMessageData>) -> Result<Option<ClientSheetItemDelta>, String> {

        let option_control = self.controls.iter().find(|&c| c.id == control_id);
        if option_control.is_none() {
            return Err("control not found".to_string())
        }

        let control = option_control.unwrap();
        if let Err(e) = control.emit(event_name, context, payload) {
            println!("Error: {}", e);
            return Err(e);
        }

        let mut delta: Option<ClientSheetItemDelta> = None;
        let value: Option<String> = control.get_value();

        // if let Some(ref i) = control.icon {
        //     icon = Some(i.clone());
        // }

        if value.is_some() {
            delta = Some(ClientSheetItemDelta {
                action: control_id.clone(),
                value,
            });
        }

        Ok(delta)
    }
}


pub fn load_state(config_dir: PathBuf) -> State {

    let sheets = get_sheet_list(config_dir.clone());
    let controls = get_control_list(config_dir.clone());

    let state = State {
        config_dir,
        controls,
        sheets,
    };

    state
}
