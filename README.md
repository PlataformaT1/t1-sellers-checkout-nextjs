# t1-sellers-checkout-nextjs

Checkout app for sellers made in Next.js 15

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
| --- | --- |
| `KEYCLOAK` | Holds the Keycloak configuration in JSON format. |
| `AUTH_URL` | The base URL for authentication services. |
| `IDENTITY_URL` | The base URL for the identity service. |
| `KEYCLOAK_ADMIN_CREDENTIALS` | Contains the admin credentials for Keycloak in JSON format. |
| `AUTH_SECRET` | A secret key used for session authentication. |
| `OTP_SERVICE_URL` | The base URL for the One-Time Password (OTP) service. |
| `NEXT_PUBLIC_ACCOUNT_URL` | The public URL for the acoount. |
| `NEXT_PUBLIC_WORKSPACE_URL` | The public URL for the workspace, used for redirects. |

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with Redux provider
│   └── page.tsx        # Home page
├── components/         # React components
│   └── ReduxProvider.tsx
├── store/              # Redux store setup
│   ├── index.ts        # Store configuration
│   └── slices/         # Redux slices
├── styles/             # SCSS styles
│   ├── globals.scss    # Global styles
│   └── components/     # Component-specific styles
```

## Redux Setup

- Redux Toolkit configured with TypedScript
- Example counter slice included
- Typed hooks (useAppDispatch, useAppSelector) ready to use

## Migration Notes

- App Router configured for modern Next.js routing
- SCSS support enabled
- Path aliases configured (@/* for src/*)
- Ready to receive migrated Angular components

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

Start migrating your Angular components! Each component should be converted to:
1. React functional component in `src/components/`
2. SCSS styles in `src/styles/components/`
3. Redux slices for state management if needed
