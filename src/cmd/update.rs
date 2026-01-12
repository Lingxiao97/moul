use clap::{App, ArgMatches};
use colored::*;
use semver::Version;
use self_update::cargo_crate_version;
use anyhow::Result;

pub fn update_command() -> App<'static> {
    App::new("update")
        .about("Update to latest version")
        .version(cargo_crate_version!())
}

pub fn execute(_matches: &ArgMatches) -> Result<()> {
    let current_version = Version::parse(cargo_crate_version!())?;
    
    let status = self_update::backends::github::Update::configure()
        .repo_owner("moulco")
        .repo_name("moul")
        .bin_name("moul")
        .current_version(cargo_crate_version!())
        .build()?
        .update()?;

    if status.updated() {
        println!("{}", "Successfully updated to latest version".green());
    } else {
        println!("Current binary {} is the latest version", current_version);
    }

    Ok(())
} 