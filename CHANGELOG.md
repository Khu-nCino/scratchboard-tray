## [0.6.1] - 2020-9-10
- Package list is now sorted by name
- Capitalized target dropdown

## [0.6.0] - 2020-9-8
- Ability to upgrade packages.
- Ability to see latest patch targets for packages.
- Ability to see managed packages.

## [0.5.0] - 2020-7-13
- Ability to view installed package versions.
- Ability to see latest package versions.
- Ability to open package install url.

## [0.4.3] - 2020-7-8
- Windows login setting doesn't display actual value.
- Initial aliases not being set with authenticate action.
- Overflow styling.
- Delete action will stop blocking org after an error has occurred.
- Updated example url for link converter.
- Quick and dirty Netskope fix.

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
