use std::fs::{File, read_to_string};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::{Result, Value};

#[derive(Serialize, Deserialize)]
struct Control {
    id: String,
    r#type: String,
    style: Option<String>,
    label: String,
    disabled: bool,
    default: String,
    props: HashMap<String, String>,
    platform: Option<String>,

    url: Option<String>,
    command: Option<String>,
    commands: Option<Vec<String>>,
    hotkey: Option<String>,
    hotkeys: Option<Vec<String>>,
    sync: Option<bool>,
}

#[derive(Serialize, Deserialize)]
struct Sheet {
    columns: u32,
    items: Vec<Control>,
}


pub fn load_controls() {
    let config = tauri::Config::default();

    println!("config: {:?}", config);

}



pub fn emit(control_id: String) -> Result<()> {
    let control = Control {
        id: "button".to_string(),
        r#type: "button".to_string(),
        style: None,
        label: "Button".to_string(),
        disabled: false,
        default: "Button".to_string(),
        props: HashMap::new(),
        platform: None,

        url: None,
        command: None,
        commands: None,
        hotkey: None,
        hotkeys: None,
        sync: None,
    };

    let sheet = Sheet {
        columns: 1,
        items: vec![control],
    };

    let json = serde_json::to_string(&sheet)?;

    println!("{}", json);

    Ok(())
}
