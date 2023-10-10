use std::{env, process::{Command, Child}, io};

pub fn browse(url: &String) -> Result<Child, io::Error> {
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

    command_result
}
