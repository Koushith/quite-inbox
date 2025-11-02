# OG Image Setup Instructions

## Step 1: Generate the OG Image

1. Open `og-image-template.html` in your browser (Chrome recommended)
2. Press `F11` or `Cmd+Ctrl+F` to enter fullscreen mode
3. Use a screenshot tool to capture exactly 1200x630 pixels:

### Mac Users:
```bash
# Option 1: Using built-in screenshot tool
# Press Cmd+Shift+4, then drag to select the black area
# Make sure to capture exactly 1200x630 pixels

# Option 2: Using ImageMagick (if installed)
# Screenshot the area first, then resize:
magick input.png -resize 1200x630! public/og-image.png
```

### Windows Users:
```bash
# Use Snipping Tool or Snip & Sketch
# Select the black rectangular area
# Save as "og-image.png"
```

### Using Browser DevTools (Most Accurate):
1. Open `og-image-template.html` in Chrome
2. Press F12 to open DevTools
3. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
4. Type "Capture full size screenshot" and press Enter
5. Crop the image to 1200x630px using any image editor

## Step 2: Save the Image

Save the screenshot as:
```
public/og-image.png
```

## Step 3: Verify

1. The image should be exactly **1200x630 pixels**
2. File format should be **PNG** (for best quality)
3. File size should be under 1MB (ideally under 500KB)

## Step 4: Test OG Image

Use these tools to test how your OG image appears on social media:

- **Facebook/LinkedIn**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **General**: https://www.opengraph.xyz/

## Optional: Generate Additional Sizes

You may also want to generate additional sizes for different platforms:

```bash
# Apple Touch Icon (180x180)
magick og-image.png -resize 180x180 public/apple-touch-icon.png

# Android Chrome (512x512)
magick og-image.png -resize 512x512 public/android-chrome-512x512.png

# Favicon PNG (32x32)
magick og-image.png -resize 32x32 public/favicon-32x32.png
```

## Current Setup

The HTML meta tags are already configured in `index.html`:

- **Title**: QuiteInbox - Take Back Control Of Your Inbox
- **Description**: Unsubscribe from unwanted emails in seconds. No servers. No tracking.
- **OG Image**: https://quiteinbox.app/og-image.png (1200x630)
- **Theme Color**: #000000 (Black)

## Deployment Note

When you deploy to production, make sure the domain in the OG tags matches your actual domain:
- Update `https://quiteinbox.app/` to your actual domain
- Update the og:image URL to use the full absolute URL

---

**Need help?** Check the template file at `og-image-template.html` for the design preview.
