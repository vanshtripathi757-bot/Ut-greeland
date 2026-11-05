# The School Chronicles

A mobile-first, browser-based 3D school-life game prototype built with React, TypeScript, Vite and Three.js.

**Status:** This repository currently contains a WebGL browser prototype. It is not yet a native Android APK or a Unity project. Native Android packaging and real-device validation are separate future milestones.

## Development from an Android phone

Use a browser-based coding workspace that provides a terminal and live preview.

1. Open this repository in your coding workspace.
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
4. Open the workspace preview URL on your phone.

Vite listens on `0.0.0.0:3000` so supported cloud workspaces can expose the preview.

## Quality checks

- `npm run lint` — TypeScript type-check.
- `npm test` — movement, jump, collision and camera tests.
- `npm run build` — production web build.

## Current prototype systems

- Procedural academy courtyard and environment.
- Procedural anime-inspired student character.
- Third-person and first-person camera modes.
- Walk, sprint, jump and stamina mechanics.
- Touch-oriented movement controls and HUD.
- Basic collision and lighting systems.

## Android-first priorities

1. Keep core controls comfortable on touch screens.
2. Test narrow phone viewports and orientation changes.
3. Keep real-time shadows, geometry and particles within mobile GPU limits.
4. Handle resize, tab pause/resume and WebGL context loss.
5. Profile on a real Android device before claiming performance targets.
6. Treat native APK packaging as a separate, later milestone.

## Project structure

- `src/game/` — Three.js scene, character, movement rules, textures and tests.
- `src/components/` — game HUD and screens.
- `src/` — React application entry and integration.

## Secrets

Never commit API keys or real credentials. Keep local secrets in environment files excluded by `.gitignore`; use `.env.example` only for placeholder variable names.
