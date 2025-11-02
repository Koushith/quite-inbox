# Getting Started with SubZero

This guide will help you set up and run SubZero locally.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google OAuth

You need to create a Google Cloud project and OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add these redirect URIs:
   - `http://localhost:5173/oauth/callback`

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Client ID:

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
src/
├── lib/              # Core business logic
│   ├── auth/         # OAuth PKCE implementation
│   ├── api/          # Gmail API client
│   ├── parsers/      # Email header parsing
│   ├── grouping/     # Sender grouping logic
│   ├── actions/      # Unsubscribe & cleanup actions
│   ├── storage/      # IndexedDB (Dexie)
│   └── utils/        # Helper functions
├── components/ui/    # shadcn/ui components
├── routes/           # React Router pages
├── stores/           # Zustand state management
└── types/            # TypeScript types
```

## Key Features Implemented

- ✅ Google OAuth with PKCE
- ✅ Gmail API integration (list messages, get metadata)
- ✅ Header parsing (List-Unsubscribe, List-Id)
- ✅ Message grouping by sender
- ✅ Multiple unsubscribe methods (one-click, HTTP, mailto)
- ✅ Email cleanup (archive/trash)
- ✅ Protected keywords for safety
- ✅ Activity log (local)
- ✅ Dark mode
- ✅ IndexedDB storage (Dexie)
- ✅ Export/import data

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run test     # Run unit tests
npm run lint     # Run ESLint
```

## Next Steps

1. **Test the OAuth flow**: Sign in with Google to verify your OAuth setup
2. **Run a scan**: Test scanning your inbox for subscriptions
3. **Customize protected keywords**: Edit settings to add your own protected keywords/domains
4. **Add tests**: Write more tests for edge cases
5. **Deploy**: Deploy to Vercel, Netlify, or your preferred platform

## Deployment

To deploy SubZero:

1. Update the OAuth redirect URIs in Google Cloud Console with your production domain
2. Set `VITE_GOOGLE_CLIENT_ID` environment variable in your hosting platform
3. Build and deploy:

```bash
npm run build
# Upload the 'dist' folder to your hosting service
```

## Troubleshooting

### Build Errors

If you encounter Tailwind CSS errors, make sure you have `@tailwindcss/postcss` installed:

```bash
npm install -D @tailwindcss/postcss
```

### OAuth Errors

- Verify your redirect URI exactly matches what's in Google Cloud Console
- Make sure the Gmail API is enabled in your project
- Check that your Client ID is correct in `.env`

### Node Version

The project requires Node.js 20.19+ or 22.12+. If you have an older version, upgrade Node.js.

## Privacy & Security

SubZero is designed with privacy first:

- All data stored locally in IndexedDB
- No server-side storage
- No analytics or telemetry
- OAuth uses PKCE for security
- Protected keywords prevent accidental deletions

See [README.md](README.md) for full privacy guarantees.

## Contributing

See [README.md](README.md) for contribution guidelines.

## Support

- Report issues: [GitHub Issues](https://github.com/your-username/subzero-app/issues)
- Discussions: [GitHub Discussions](https://github.com/your-username/subzero-app/discussions)
