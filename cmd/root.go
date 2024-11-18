use clap::{App, SubCommand};

pub fn version_cmd() -> App<'static, 'static> {
    SubCommand::with_name("version")
        .about("Version")
        .long_about("Version")
        .display_order(1)
}

pub fn execute() {
    println!("{}", crate::VERSION);
}
