# Cat Critter Playground

A single-page, cat-friendly playground where colorful bugs, flies, lizards, and mice scurry around the screen. Cats can tap or swipe at them to make them pop away.

## Running locally

No build tools required. Serve the static files with any HTTP server (or open `index.html` directly).

```bash
# from the repo root
python -m http.server 8000
# then open http://localhost:8000 in your browser or tablet
```

## Controls

- **Add more critters** – instantly drop a handful of critters.
- **Auto-spawn toggle** – keeps a steady stream of new critters.
- **Reset** – clear the field and score.
- Tap, click, or swipe across the play field to splat critters and keep curious paws engaged.
# Cat App – Flutter Starter

This repository provides a lightweight Flutter starter that targets both Android and iOS. It contains a simple Material app, opinionated linting, and setup notes so you can build and ship quickly once Flutter is available in your environment.

## Prerequisites

1. Install the Flutter SDK (3.22+ recommended) by following the [official installation guide](https://docs.flutter.dev/get-started/install).
2. Run `flutter doctor` and address any reported issues (Android toolchain, Xcode, device simulators).
3. From this repository root, configure the platform folders (generated files are ignored from Git):
   - `flutter create . --platforms android,ios`

> The `android/` and `ios/` folders are intentionally git-ignored. Regenerate them locally with the command above so that Gradle/Xcode metadata matches your environment.

## Development

- Fetch dependencies: `flutter pub get`
- Run the app on a device or emulator: `flutter run`
- Format code: `flutter format .`
- Analyze and test:
  - `flutter analyze`
  - `flutter test`

## Project structure

- `lib/main.dart` – entry point with a basic themable counter-style sample you can customize.
- `analysis_options.yaml` – enables `flutter_lints` for sensible defaults.
- `pubspec.yaml` – dependencies and metadata.
- `test/widget_test.dart` – widget smoke test for the sample UI.

## Deployment tips

- **Android**: create a release keystore, configure `key.properties`, and run `flutter build appbundle`.
- **iOS**: ensure Xcode signing is set up, then run `flutter build ipa`.
- Use `flutter build` outputs directly in Play Console and App Store Connect.
