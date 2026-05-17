# SVFS Mobile

Mobile app for the SVFS (Smart Vehicle Freight System) logistics platform. Built with React Native and Expo, targeting iOS and Android.

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Routing | Expo Router (file-based) |
| Language | TypeScript |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| UI Components | Gluestack UI v2 |
| State Management | Redux Toolkit |
| Server State | TanStack React Query v5 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod |
| Auth Storage | Expo SecureStore |

## Project Structure

```
svfs-mobile/
├── app/                        # All screens and navigation (Expo Router)
│   ├── _layout.tsx             # Root layout — wraps the entire app
│   ├── +not-found.tsx          # 404 screen
│   ├── modal.tsx               # Modal screen
│   └── (tabs)/                 # Bottom tab navigator
│       ├── _layout.tsx         # Tab bar configuration
│       └── index.tsx           # Default tab screen
│
├── src/                        # App logic layer
│   ├── services/               # API functions (one file per resource)
│   ├── store/                  # Redux slices (auth, workspace, theme)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Axios instance + interceptors
│   ├── types/                  # TypeScript interfaces
│   └── components/
│       └── ui/
│           └── gluestack-ui-provider/  # Theme provider setup
│
├── components/                 # Shared UI components
├── constants/                  # App-wide constants (colors, etc.)
├── assets/                     # Fonts, images, icons
│
├── global.css                  # Tailwind directives (NativeWind entry point)
├── tailwind.config.js          # Tailwind + NativeWind configuration
├── babel.config.js             # Babel preset for NativeWind
├── metro.config.js             # Metro bundler + NativeWind integration
├── nativewind-env.d.ts         # TypeScript declaration for CSS imports
├── app.json                    # Expo app configuration
└── tsconfig.json               # TypeScript config + path aliases
```

## Path Aliases

| Alias | Resolves to |
|---|---|
| `@/*` | `./*` (project root) |
| `@services/*` | `./src/services/*` |
| `@store/*` | `./src/store/*` |
| `@hooks/*` | `./src/hooks/*` |
| `@lib/*` | `./src/lib/*` |
| `@types/*` | `./src/types/*` |
| `@ui/*` | `./src/components/ui/*` |

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- For iOS: Xcode (Mac only)
- For Android: Android Studio + emulator, or a physical device with [Expo Go](https://expo.dev/go)

### Install dependencies

```bash
npm install
```

### Run the app

```bash
# Start the dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in browser (web)
npm run web
```

## Backend

This app connects to the [svfs-be](../svfs-be) Express + PostgreSQL API. Make sure the backend is running before starting the app.

Configure the API base URL in `src/lib/` (Axios instance).

## Related

- [svfs-fe](../svfs-fe) — Web app (React + Vite)
- [svfs-be](../svfs-be) — REST API (Express + Prisma + PostgreSQL)
