<h1 align="center">
  Scratchboard
</h1>

<h4 align="center">A tray based salesforce org manager built for easy of use. <a href="http://electron.atom.io" target="_blank">Electron</a>, <a href="https://blueprintjs.com/" target="_blank">BlueprintJS</a> and <a href="https://github.com/forcedotcom/sfdx-core">sfdx-core</a>.</h4>

<p align="center">
  <a href="#motivation">Motivation</a> •
  <a href="#features">Features</a> •
  <a href="#download">Download</a> •
  <a href="#setup">Setup</a>
</p>

<div align="center">
<img width="440" alt="Scratchboard" src="screenshots/application.png">
</div>

## Motivation

* I wanted to see if it was possible to make it easier to track and manager your salesforce orgs with a sfdx-core based gui.
* People can forget that a scratch org will soon expire and an active reminder could be useful.

## Features

* Tray Based
  - Lives in your computer tray for quick access.
* Supports both scratch orgs and standard orgs
* SFDX Actions
  - Open Orgs
  - Set Aliases
  - Copy Frontdoor
  - Delete Orgs (Scratch orgs only)
  - Logout of Orgs (NonScratch orgs only)
  - Login to orgs
  - Convert an arbitrary salesforce url into a frontdoor url.
  - More to come...
* Quickly see days until org expiration.
* Automaticly stays in sync with sfdx with no need to manually refresh org list.
* Dark/Light mode
* Automatically Download and Install Updates
* OS Support
  - Macos
  - Windows and Linux planned

## Download

You can download the latest version of Scratchboard [here](https://github.com/gabriel-keith/scratchboard-tray/releases/tag/v3.0.0).

## Setup

#### Dependencies

This project can mostly function without sfdx installed but
[NodeJs](https://nodejs.org/en/) and [SFDX](https://developer.salesforce.com/tools/sfdxcli) are still required to use the login functionality.  
Using [nvm](https://github.com/nvm-sh/nvm) to manage your node version is supported.

#### SFDX Binary Path
You may need to configure your SFDX binary path for Scratchboard to work.  
If your on a unix based system you can use the `which sfdx` command to easily the path to your sfdx binary. 
