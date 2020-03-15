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

* It's usually quicker to open an org with a gui than it is to type in a sfdx command in the terminal.
* Orgs can expire unexpectedly and this app is meant to remind you when that will happen.

## Features

* Tray Based
  - Lives in your computer tray for quick access from anywhere.
* Open Orgs
* See days until expiration
* Set Aliases
* Copy Org Urls
* Delete Orgs
* Dark/Light mode
* OS Support
  - Macos
  - Windows and Linux planned

## Download

You can [download](https://github.com/gabriel-keith/scratchboard-tray/releases/tag/0.1.1) the latest version of Scratchboard.

## Setup

#### Dependencies

[NodeJs](https://nodejs.org/en/) and [SFDX](https://developer.salesforce.com/tools/sfdxcli) are required for scratchboard to work.

#### SFDX Binary Path
You may need to configure your SFDX binary path for Scratchboard to work.

If your on a unix system you can copy the output of the following command into your scratchboard settings screen:

```bash
$ which sfdx
```
