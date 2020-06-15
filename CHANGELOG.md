## [0.4.0]
### Changes
- Authenticate org action now uses core-sfdx.
- Removed sfdx binary setting. No actions use the sfdx command anymore.
- Window is now focused again after authentication is finished.
### Fixes
- Changed windows tray behavior so that double clicks and long click behave as expected.
### Dependencies
- Updated electron 9.0.3 -> 9.0.4

## [0.3.3] - 2020-6-12
### Fixes
- On macos tray is now opened on mouse down rather than mouse click.
- Fixed broken app file in zip distribution
- Prevented reattempts to load org data if no expiration date on disconnected auth file.
- Fixed errors loading application when no sfdx configuration is present.
- Fixed windows crash when tray is closed
- Fixed windows crash when the settings page is viewed.
