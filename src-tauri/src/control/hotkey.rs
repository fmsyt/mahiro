use enigo::{Enigo, KeyboardControllable};


#[derive(Debug)]
pub struct KeySequence {
    sequences: Vec<String>,
}

pub trait KeybdKeyStreamInitializer {
    fn from_string(s: String) -> Self;
}

/**
 * Reference: https://learn.microsoft.com/ja-jp/windows/win32/inputdev/virtual-key-codes
 */
impl KeybdKeyStreamInitializer for KeySequence {
    fn from_string(s: String) -> Self {
        let combined_hotkey = s.split("+").collect::<Vec<&str>>();

        let mut result: String = String::new();

        let mut press_special_keys: Vec<&str> = vec![];

        combined_hotkey.iter().for_each(|key| {

            if key.len() == 1 {
                if let Some(c) = key.to_ascii_lowercase().chars().next() {
                    result.push(c);
                }
            } else {
                match key.to_lowercase().as_str() {
                    "ctrl" => {
                        press_special_keys.push("CTRL");
                    }
                    "alt" => {
                        press_special_keys.push("ALT");
                    }
                    "shift" => {
                        press_special_keys.push("SHIFT");
                    }
                    "win" => {
                        press_special_keys.push("META");
                    }
                    _ => {
                        eprintln!("Error: Invalid key: {}", key);
                    }
                }
            }

        });

        for special_key in press_special_keys.iter() {
            result = format!("{{+{}}}{}{{-{}}}", special_key, result, special_key);
        }

        KeySequence {
            sequences: vec![result],
        }
    }
}

pub trait KeybdKeyStreamHandler {
    fn send(&self);
}

impl KeybdKeyStreamHandler for KeySequence {
    fn send(&self) {
        let mut enigo = Enigo::new();

        for sequence in self.sequences.iter() {
            if let Err(e) = enigo.key_sequence_parse_try(sequence) {
                eprintln!("Error: {}", e);
            }
        }
    }
}
