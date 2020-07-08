## [0.4.3] - 2020-7-8
- Windows login setting doesn't display actual value.
- Initial aliases not being set with authenticate action.
- Overflow styling.
- Delete action will stop blocking org after an error has occurred.
- Updated example url for link converter.

## [0.4.2] - 2020-6-21
## Fixes
- Regression in ability to delete scratch orgs.

## [0.4.1] - 2020-6-20
## Fixes
- Used sfdx-core method to delete auth files. This will deleted secondary usernames, org files and sandbox files too.
- Fixed issue compiling on linux.

## [0.4.0] - 2020-6-16
### Changes
- Authenticate org action now uses core-sfdx.
- Removed sfdx binary setting. No actions use the sfdx command anymore.
- Added setting to hide secondary usernames.
- Window is now focused again after authentication is finished.
- Windows - App is now open as hidden if it was started with the "Run at Login" setting 
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
