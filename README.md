# Naliv Merchant

React + Vite frontend for the merchant order processing panel.

## Scripts

- `npm run dev` - start local development server
- `npm run build` - type-check and build production assets into `dist`
- `npm run lint` - run ESLint

## API

The app uses `https://njt25.naliv.kz` as `BASE_URL`.

Authentication is handled by manually entering a Bearer token. The token is
stored in `localStorage` under `auth_token` and attached to API requests.
