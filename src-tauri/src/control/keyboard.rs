use enigo::{Enigo, KeyboardControllable, dsl::ParseError};

pub fn send_text(text: String) -> Result<(), ParseError> {
    let mut enigo = Enigo::new();
    let result = enigo.key_sequence_parse_try(&text);

    result
}
