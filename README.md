<h1 align="center">
  Scratchboard
</h1>

<h4 align="center">A scratch org manager for your tray, build using <a href="http://electron.atom.io" target="_blank">Electron</a> and <a href="https://blueprintjs.com/" target="_blank">BlueprintJS</>.</h4>

<p align="center">
  <a href="#prerelease-disclaimer">Prerelease Disclaimer</a> •
  <a href="#motivation">Motivation</a> •
  <a href="#features">Features</a> •
  <a href="#download">Download</a> •
  <a href="#setup">Setup</a>
</p>

<div align="center">
<img width="440" alt="Scratchboard" src="https://user-images.githubusercontent.com/47356856/76692137-93a4d680-6628-11ea-961c-a2de5a31ea18.png">
</div>

## Prerelease Disclaimer

This Project is in prerelease and bugs should be expected.  
However if you'd like to give it a try and provide feedback you're more than welcome!

## Motivation

* Often it's quicker to open an org through a tray based app than it is to type the command into your terminal.
* It's easy to forget that an orgs expiration is approaching, this app is meant to remind you how much time is left on an org.

## Features

* Tray Based
  - Lives in your computer tray for quick access.
* SFDX Actions
  - Open Orgs
  - Set Aliases
  - Copy Frontdoor
  - Delete Orgs
* See days until org expiration.
* Dark/Light mode
* Automatically Download and Install Updates
* OS Support
  - Macos
  - Windows and Linux planned

## Download

You can download the latest version of Scratchboard [here](https://github.com/gabriel-keith/scratchboard-tray/releases/tag/v2.0.0).

## Setup

#### Dependencies

[NodeJs](https://nodejs.org/en/) and [SFDX](https://developer.salesforce.com/tools/sfdxcli) are required for scratchboard to work.  
Using [nvm](https://github.com/nvm-sh/nvm) to manage your node version is supported.

#### SFDX Binary Path
You may need to configure your SFDX binary path for Scratchboard to work.  
If your on a unix based system you can use the `which sfdx` command to easily the path to your sfdx binary. 
