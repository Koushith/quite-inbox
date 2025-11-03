# Privacy Policy and Terms of Service

## For OAuth Verification

Create these pages in your app and host them at:
- https://www.quiteinbox.xyz/privacy
- https://www.quiteinbox.xyz/terms

---

## PRIVACY POLICY (Draft)

**Last Updated: [Date]**

### Introduction
QuiteInbox ("we", "our", "app") is a free, open-source email management tool that helps you unsubscribe from unwanted emails. This privacy policy explains how we handle your data.

### What We Collect
- **Gmail Access:** We request permission to read, modify, and send emails through the Gmail API
- **Local Storage:** Email metadata (sender names, domains, unsubscribe links, message counts) is stored locally in your browser's IndexedDB

### What We DON'T Collect
- We do NOT send your email content to any server
- We do NOT store your data on any server
- We do NOT track your usage
- We do NOT sell your data to third parties
- We do NOT use analytics or tracking tools

### How We Use Your Data
1. **Read Access:** To scan your inbox and identify subscription emails
2. **Modify Access:** To delete or archive old emails and create Gmail filters (only when you request it)
3. **Send Access:** To send unsubscribe requests when one-click unsubscribe is not available

### Data Storage
All data is stored locally in your browser using:
- **IndexedDB:** For sender groups and action logs
- **LocalStorage:** For OAuth tokens and settings
- **SessionStorage:** For temporary OAuth state

### Data Deletion
You can delete all local data by:
1. Clearing your browser data
2. Using the export/delete feature in settings
3. Revoking app access at https://myaccount.google.com/permissions

### Third-Party Services
We use Google OAuth and Gmail API. Their privacy policies apply:
- Google Privacy Policy: https://policies.google.com/privacy

### Your Rights
You have the right to:
- Access your data (it's all local in your browser)
- Delete your data at any time
- Revoke app permissions
- Export your data

### Open Source
QuiteInbox is 100% open source. You can verify our privacy claims by reviewing the code at:
https://github.com/Koushith/quite-inbox

### Contact
For privacy questions: [Your Email]

---

## TERMS OF SERVICE (Draft)

**Last Updated: [Date]**

### 1. Acceptance of Terms
By using QuiteInbox, you agree to these terms.

### 2. Description of Service
QuiteInbox is a free tool that helps you:
- Find subscription emails in your Gmail
- Unsubscribe from unwanted senders
- Delete or archive old emails
- All processing happens locally in your browser

### 3. User Responsibilities
You agree to:
- Use the app responsibly
- Not abuse the Gmail API
- Not use the app for spam or malicious purposes
- Comply with Gmail's Terms of Service

### 4. Privacy and Data
- All data processing happens locally in your browser
- We do not store your data on any server
- See our Privacy Policy for details

### 5. No Warranty
QuiteInbox is provided "as is" without warranties. We are not responsible for:
- Accidental data loss
- Emails deleted by mistake (use carefully!)
- Gmail API downtime or issues

### 6. Limitation of Liability
We are not liable for any damages resulting from your use of QuiteInbox.

### 7. Changes to Terms
We may update these terms. Continued use means you accept the changes.

### 8. Open Source License
QuiteInbox is licensed under [Your License - likely MIT or AGPL-3.0].

### 9. Contact
For questions: [Your Email]

---

## FOR YOUTUBE VIDEO (Script)

**Title:** "QuiteInbox - Gmail OAuth Verification Demo"

**Script:**

"Hi, I'm demonstrating QuiteInbox, a privacy-first email unsubscribe tool.

[Show landing page]
This is the home page. When users click 'Get Started', they see our OAuth permission modal.

[Show permission modal]
We clearly explain why we need each permission:
- Read: To scan inbox for subscriptions
- Modify: To delete old emails (only when user requests)
- Send: To send unsubscribe requests

[Click Connect Gmail]
Users authenticate with Google. We use PKCE for security.

[After auth, show dashboard]
The app scans the inbox locally using the Gmail API. All processing happens in the browser - we never send data to our servers.

[Show sender groups]
Here are detected subscription senders. Users can click to unsubscribe or delete old emails.

[Show action]
When a user unsubscribes, we use the official unsubscribe link from the email headers.

[Show settings]
Users can revoke access anytime through Google's account settings.

[Show code/GitHub]
QuiteInbox is 100% open source. Anyone can verify our privacy claims by reviewing the code.

Thank you!"

**Upload this video to YouTube as unlisted and provide the link in the verification form.**

---

## Checklist for OAuth Verification

- [ ] Create Privacy Policy page at /privacy
- [ ] Create Terms of Service page at /terms
- [ ] Record YouTube demo video (2-3 minutes)
- [ ] Upload video as unlisted to YouTube
- [ ] Add app logo (120x120px minimum)
- [ ] Configure OAuth consent screen completely
- [ ] Add authorized domain: quiteinbox.xyz
- [ ] Submit verification form with all links
- [ ] Wait 3-7 days for Google review

## Timeline
- Initial review: 3-7 business days
- If more info needed: Google will email you
- Total time: 1-2 weeks typically

## Note
Until verified, you can add up to 100 test users who can use the app without the warning screen.
