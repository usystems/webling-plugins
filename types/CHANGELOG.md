# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2021-07-04
### Added
- `IWeblingPluginState` and `IWeblingPluginConfig` can now be watched
- Add `IWeblingPluginPrefs` Interface
- Hook labels can be functions returning the label

### Changed
- The` onLoad` lifecycle hook is optional
- The Custom Element of a chook is direclty passed to the hook using the `element` property. The `tagName` was removed.

## [1.0.9] - 2021-06-19
### Changed
- Internal refactor

## [1.0.8] - 2021-06-19
### Fixed
- Fix typings

## [1.0.0] - 2021-06-19
### Added
- First Release
