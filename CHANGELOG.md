# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2024-11-21

### Fixed
- Resolved login not being applied

## [1.2.1] - 2024-11-15
### Fixed
- Resolved login and registration functionality
- Fixed database connection issues and schema handling
- Restored emoji library functionality for schedule editing
- Improved error handling in authentication system
- Added proper cleanup of IndexedDB data when switching to server mode

## [1.2.0] - 2024-09-27
### Added
- Ability to reset/delete the current library
- Name input field in the introduction popup for new libraries
- Server-side API for schedule library management
- Improved error handling and user feedback throughout the application

### Changed
- Updated app initialization process to prevent duplicate library creation
- Improved sharing functionality with better mobile support

### Fixed
- Resolved issues with edit popups not appearing when clicking on emojis
- Fixed API endpoint implementation for public library search and emoji library merging

## [1.1.6] - 2024-09-20
### Added
- Compact view for schedule sharing on mobile devices

### Fixed
- Addressed issue with schedule image appearance when sharing on mobile devices

## [1.1.5] - 2024-09-19
### Added
- Ability to share time allocation chart alongside schedule
- New TimeAllocationChart component for visual representation of time data
- Support for both daily and weekly time allocation data in ShareModal

### Changed
- COLORS import across relevant components

## [1.1.4] - 2024-09-16
### Added
- Restored help button for the Emoji Library
- Implemented confirmation dialog for "Restore Defaults" function in Emoji Library

### Changed
- Improved user safety by adding a confirmation step before restoring default emojis

## [1.1.3] - 2024-09-15
### Changed
- Clock times in the schedule are now visible by default for improved initial comprehension
- Time visibility setting is now persistent across page reloads and app restarts

### Added
- Local storage implementation for time visibility preference

## [1.1.2] - 2024-09-14
### Changed
- Updated cooking emoji in default set from 🍳 to 🍲 to better represent diverse culinary activities

## [1.1.1] - 2024-09-13
### Fixed
- Resolved mobile layout issue in Emoji Library
- Implemented responsive design for input fields to prevent horizontal overflow
- Adjusted button layout for improved mobile usability

## [1.1.0] - 2024-09-13
### Added
- Ten color themes
- Time allocation chart
- PWA and mobile friendly
- Social sharing of schedule
- Week-long schedule
- Select week starting day (Monday or Sunday)
- Tool tip encouraging customization
- Swipe or press button to show time info
- Help modal for schedule

## [1.0.0] - 2024-08-28
### Added
- Initial release of JSUsCH²R
- 24-hour schedule representation using emojis
- Real-time clock display
- Customizable emoji library
  - Add and remove emojis
  - Default set of emojis with activities
- Editable schedule
  - Click on emojis to edit activity and emoji for each hour
- Persistent local storage for schedule and emoji library
- Responsive design for various screen sizes
- "Restore Defaults" functionality for emoji library
- Author credit with link to personal website

