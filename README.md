# SubZero

**Privacy-first, local-first Gmail subscription cleaner**

SubZero helps you find, manage, and unsubscribe from email subscriptions in your Gmail inbox—without sending your data to any third-party server.

---

## Features

- **Local-First Architecture**: All processing happens in your browser. No server-side storage of your email content or metadata.
- **Smart Subscription Detection**: Automatically identifies subscriptions using RFC 8058 headers and heuristics
- **Multiple Unsubscribe Methods**:
  - One-click unsubscribe (RFC 8058 compliant)
  - HTTP link unsubscribe
  - Mailto unsubscribe
- **Bulk Actions**: Unsubscribe from multiple senders at once
- **Email Cleanup**: Archive or delete old subscription emails
- **Safety First**: Protected keywords prevent accidental deletion of important emails (banking, receipts, OTPs, etc.)
- **Activity Log**: Local audit trail of all actions performed
- **Dark Mode**: Built-in light/dark theme support
- **Export/Import**: Export your settings and action logs as JSON

---

## Privacy Guarantees

### What SubZero Does NOT Do

- ❌ Store your email content on any server
- ❌ Send your email metadata to third parties
- ❌ Include analytics or telemetry
- ❌ Track your usage
- ❌ Sell or share your data

### What SubZero DOES

- ✅ Store minimal metadata locally in IndexedDB (sender groups, action logs, settings)
- ✅ Use Google OAuth with PKCE for secure authentication
- ✅ Request only the Gmail permissions you explicitly authorize
- ✅ Provide full transparency as open-source software

### Data Storage

All data is stored locally in your browser using IndexedDB:

- **Sender Groups**: Sender name, domain, message count, unsubscribe method, safety flags
- **Action Log**: Timestamped record of actions (unsubscribe, archive, delete) with results
- **Settings**: Theme preference, protected keywords/domains, scope permissions
- **Scan Checkpoint**: Last scan time and processed message IDs (for resumable scans)

**No email content or message bodies are ever stored.**

---

## Gmail OAuth Scopes

SubZero uses Google OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication.

### Required Scope

- **`gmail.readonly`**: Read email headers and metadata to find subscriptions and their unsubscribe methods

### Optional Scopes (Opt-in)

- **`gmail.modify`**: Archive, trash, or delete old subscription emails; create Gmail filters
- **`gmail.send`**: Send unsubscribe emails directly via Gmail API (alternative to opening mail client)

You can enable/disable optional scopes in the onboarding flow and in Settings.

---

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- A Google Cloud project with OAuth 2.0 credentials

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/subzero-app.git
cd subzero-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google OAuth

**⚠️ IMPORTANT**: You'll need both a **Client ID** and **Client Secret** from Google.

**Quick Setup**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project and enable the Gmail API
3. Create OAuth 2.0 credentials (Web application type)
4. Add authorized redirect URI: `http://localhost:5173/oauth/callback`
5. Copy both the **Client ID** and **Client Secret**

**📖 Detailed Instructions**: See [docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md) for step-by-step guide with screenshots and troubleshooting.

**Security Note**: For client-side apps, the OAuth client secret cannot be kept truly secret (it will be visible in the JavaScript bundle). This is a standard limitation of browser-based OAuth and is considered acceptable when combined with PKCE and strict redirect URI validation.

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Google OAuth credentials:

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

### 1. Sign In

Click "Sign in with Google" and authorize the requested Gmail scopes.

### 2. Scan Your Inbox

- Select a time range (3/6/12 months, or all time)
- Click "Start Scan"
- SubZero will scan your inbox for subscriptions

### 3. Manage Subscriptions

- View all detected subscription senders
- Each sender shows:
  - Display name and domain
  - Message count
  - Unsubscribe method (one-click, http, mailto, unknown)
  - Safety status (protected/not protected)

### 4. Unsubscribe

- Click on a sender to view details
- Click "Unsubscribe" to execute the unsubscribe action
- Or select multiple senders and use bulk actions

### 5. Cleanup Old Emails

- From a sender's detail page, choose cleanup options:
  - Archive all messages
  - Delete messages older than X days
  - Keep only the last N messages

### 6. View Activity Log

- See a timestamped log of all actions performed
- Export the log as JSON for your records

---

## Development

### Project Structure

```
src/
├── lib/
│   ├── auth/          # OAuth PKCE flow
│   ├── api/           # Gmail API client
│   ├── parsers/       # Header parsing (List-Unsubscribe, List-Id)
│   ├── grouping/      # Message grouping engine
│   ├── actions/       # Action runners (unsubscribe, cleanup, filters)
│   ├── storage/       # IndexedDB storage layer (Dexie)
│   └── utils/         # Utility functions
├── components/
│   └── ui/            # shadcn/ui components
├── routes/            # React Router pages
├── stores/            # Zustand state management
├── types/             # TypeScript type definitions
└── test/              # Test setup
```

### Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run test        # Run tests
npm run lint        # Run ESLint
```

### Testing

SubZero uses Vitest for unit testing:

```bash
npm run test        # Run all tests
npm run test:ui     # Run tests with UI
```

Key test suites:

- `src/lib/parsers/headers.test.ts` - Header parsing logic
- `src/lib/grouping/engine.test.ts` - Grouping and filtering logic

---

## Security

### Threat Model

SubZero defends against:

- **Malicious unsubscribe links**: Verifies HTTPS for one-click unsubscribe; warns if host doesn't match sender domain
- **Accidental data loss**: Protected keywords prevent bulk deletion of important emails
- **CSRF attacks**: Uses PKCE with state parameter for OAuth flow
- **XSS attacks**: Content Security Policy hardened; uses React's built-in XSS protection

### Limitations

- SubZero cannot verify if an unsubscribe link is legitimate—only that it uses HTTPS and matches expected patterns
- One-click unsubscribe sends a POST request; we accept 2xx/3xx responses per RFC 8058
- Protected keywords are heuristic-based and may not catch all sensitive emails

### Reporting Security Issues

Please report security vulnerabilities to: [your-email@example.com]

---

## FAQ

### Is SubZero really free?

Yes, SubZero is 100% free and open-source. No paid plans, no upsells.

### Does SubZero work with non-Gmail accounts?

Not currently. SubZero uses the Gmail API and is designed specifically for Gmail accounts. IMAP support may be added in the future.

### What happens if I delete SubZero?

All data is stored locally in your browser's IndexedDB. If you clear your browser data or uninstall SubZero, the data is permanently deleted. You can export your data before doing so.

### Can I use SubZero on multiple devices?

Each device stores its own local data. There's no sync between devices. You can export/import settings and action logs manually.

### Does SubZero support Google Workspace accounts?

Yes, as long as your Workspace admin allows third-party OAuth apps and the Gmail API.

---

## Roadmap

- [ ] Bulk filter creation
- [ ] Keyboard shortcuts
- [ ] Advanced filtering and search
- [ ] Improved ESP relay handling (SendGrid, Mailchimp)
- [ ] IMAP support for non-Gmail accounts
- [ ] Optional minimal proxy for CORS-blocked one-click URLs

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

## License

This project is licensed under the **Apache 2.0 License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
- Local storage with [Dexie.js](https://dexie.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

## Support

If you find SubZero useful, please:

- ⭐ Star this repository
- 🐛 Report bugs via [GitHub Issues](https://github.com/your-username/subzero-app/issues)
- 💡 Suggest features via [GitHub Discussions](https://github.com/your-username/subzero-app/discussions)

---

**SubZero** • Privacy-first subscription management • Built with ❤️ for your inbox
# quite-inbox
