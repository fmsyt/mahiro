use std::{process::{Command, Child}, io};

pub fn browse(url: &String) -> Result<Child, io::Error> {

    #[cfg(target_os = "windows")]
    let command_result = Command::new("cmd.exe").args(["/c", "start", url]).spawn();

    #[cfg(target_os = "macos")]
    let command_result = Command::new("open").args([url]).spawn();

    #[cfg(target_os = "linux")]
    let command_result = Command::new("xdg-open").args([url]).spawn();

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    let command_result = Err(io::Error::new(io::ErrorKind::Other, "Unsupported OS"));

    command_result
}
