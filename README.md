# Рабочее место комплектовщика

React + Vite frontend for order picking and processing.

## Scripts

- `npm run dev` - start local development server
- `npm run build` - type-check and build production assets into `dist`
- `npm run lint` - run ESLint

## API

The app uses `https://njt25.naliv.kz` as `BASE_URL`.

Authentication is handled by manually entering a Bearer token. The token is
stored in `localStorage` under `auth_token` and attached to API requests.

## Telegram Mini App

The app loads Telegram's official `telegram-web-app.js` script and initializes
the Mini App runtime on startup:

- calls `ready()`, `expand()`, and requests fullscreen mode with
  `requestFullscreen()` when the Telegram client supports it
- syncs Telegram viewport and safe-area values into CSS variables
- sets Telegram header, background, and bottom bar colors to the app background
- uses Telegram's header BackButton for internal route navigation
- triggers light haptic feedback on app buttons when available
