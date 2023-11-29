use std::{
    path::PathBuf,
    fs::{File, self}
};

use serde::{
    Serialize,
    Deserialize
};

use crate::client::ActionEvents;


// pub enum SheetItemType {
//     Button(String),
//     Slider(String),
//     Empty(String),
// }


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SheetItemAction<T> {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key_down: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub key_up: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub touch_tap: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dial_down: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dial_up: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dial_rotate: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub will_appear: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub will_disappear: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title_parameters_did_change: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device_did_connect: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device_did_disconnect: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub application_did_launch: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub application_did_terminate: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system_did_wake_up: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub property_inspector_did_appear: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub property_inspector_did_disappear: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub send_to_plugin: Option<T>,
}

pub trait SheetItemActionTrait<T> {
    fn get(&self, action: ActionEvents) -> Option<T>;
}

impl SheetItemActionTrait<String> for SheetItemAction<String> {
    fn get(&self, action: ActionEvents) -> Option<String> {
        match action {
            ActionEvents::KeyDown => self.key_down.clone(),
            ActionEvents::KeyUp => self.key_up.clone(),
            ActionEvents::TouchTap => self.touch_tap.clone(),
            ActionEvents::DialDown => self.dial_down.clone(),
            ActionEvents::DialUp => self.dial_up.clone(),
            ActionEvents::DialRotate => self.dial_rotate.clone(),
            ActionEvents::WillAppear => self.will_appear.clone(),
            ActionEvents::WillDisappear => self.will_disappear.clone(),
            ActionEvents::TitleParametersDidChange => self.title_parameters_did_change.clone(),
            ActionEvents::DeviceDidConnect => self.device_did_connect.clone(),
            ActionEvents::DeviceDidDisconnect => self.device_did_disconnect.clone(),
            ActionEvents::ApplicationDidLaunch => self.application_did_launch.clone(),
            ActionEvents::ApplicationDidTerminate => self.application_did_terminate.clone(),
            ActionEvents::SystemDidWakeUp => self.system_did_wake_up.clone(),
            ActionEvents::PropertyInspectorDidAppear => self.property_inspector_did_appear.clone(),
            ActionEvents::PropertyInspectorDidDisappear => self.property_inspector_did_disappear.clone(),
            ActionEvents::SendToPlugin => self.send_to_plugin.clone(),
        }
    }
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SheetItem {
    pub action: Option<SheetItemAction<String>>,
    pub label: Option<String>,
    pub icon: Option<String>,
    pub r#type: String,
    pub disabled: Option<bool>,
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Sheet {
    pub columns: i32,
    pub items: Vec<SheetItem>,
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
