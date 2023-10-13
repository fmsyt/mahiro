use std::{process::{Command, Child}, io::Result};

pub fn send(command: &String, args: Option<Vec<String>>) -> Result<Child>{
    let mut cmd = Command::new(command);
    if let Some(args) = args {
        cmd.args(args);
    }

    return cmd.spawn();
}
