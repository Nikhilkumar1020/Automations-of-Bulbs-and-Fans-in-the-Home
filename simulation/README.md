# IoT Project

This repository contains an IoT project (PlatformIO/Arduino) with the following structure:

- dashboard.html, dashboard_priya.html — web dashboards
- src/sketch.ino — main Arduino code
- platformio.ini — PlatformIO configuration
- wokwi.toml, diagram.json, libraries.txt — tooling and documentation

How to build and run

PlatformIO (recommended):

1. Open the folder in VS Code with the PlatformIO extension.
2. Run: `PlatformIO: Build` (or use the platformio CLI)

Arduino CLI (alternative):

1. Install the Arduino CLI.
2. Compile and upload according to your board and serial port.

Notes

- A `.gitignore` is present to ignore build artifacts and editor settings.
- Edit `platformio.ini` to match your target board and environment.
